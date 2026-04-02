import { CollectionService, ReplicatedStorage } from '@rbxts/services';
import { ATTRIBUTES, REMOTES, TAGS } from 'shared/constants';
import { isShopId, type ShopId, type ShopOpenPayload } from 'shared/types/shop';
import { logger } from 'shared/utils/logger';
import { BaseService } from '../../../core/Service';

/**
 * ショッププロンプトサービス
 * プレイヤーがショップNPCに近づいたときに表示されるプロンプトを管理するサービス
 */
type BoundPromptConnections = {
  /**
   * プロンプトがトリガーされたときの接続
   */
  Triggered: RBXScriptConnection;
  /**
   * プロンプトが破壊されたときの接続
   */
  Destroying: RBXScriptConnection;
};

/**
 * ショッププロンプトサービス
 * - ショップNPCにProximityPromptを配置し、プレイヤーが近づいたときにショップを開くプロンプトを表示する
 * - ProximityPromptのTriggeredイベントを監視し、プレイヤーがプロンプトをトリガーしたときにショップを開くためのRemoteEventを発火する
 * - ショップNPCやプロンプトが破壊されたときに適切に接続をクリーンアップする
 */
export class ShopPromptService extends BaseService {
  /**
   * 監視対象のProximityPromptごとに、関連イベント接続を保持するマップ
   * - key: 監視中のProximityPrompt
   * - value: Triggered/Destroyingの接続セット
   */
  private readonly _boundPrompts = new Map<
    ProximityPrompt,
    BoundPromptConnections
  >();

  /**
   * ShopNPCタグの追加を監視する接続
   * 新しく追加されたShopNPCにもプロンプト設定を適用するために使う
   */
  private _shopNpcAddedConnection?: RBXScriptConnection;

  constructor() {
    super('ShopPrompt');
  }

  /**
   * サービス開始時の処理
   * - 既存のShopNPCを検出してプロンプトを設定する
   * - ShopNPCタグの追加を監視して、新しいShopNPCにもプロンプトを設定する
   */
  public start(): void {
    // 基底クラスの開始処理を呼び出す
    super.start();

    // ショップを開くためのRemoteEventが存在しない場合は作成する
    this._getOrCreateShopOpenRemote();

    // 既に存在するShopNPCを検出してプロンプトを設定する
    const shopNpcs = CollectionService.GetTagged(TAGS.SHOP_NPC);
    logger.info('ShopPrompt', `ShopNPCタグを ${shopNpcs.size()} 件検出`);

    // 既存のShopNPCにプロンプトを設定する
    for (const shopNpc of shopNpcs) {
      this._bindShopNpc(shopNpc);
    }

    // ShopNPCタグの追加を監視して、新しいShopNPCにもプロンプトを設定する
    this._shopNpcAddedConnection = CollectionService.GetInstanceAddedSignal(
      TAGS.SHOP_NPC,
    ).Connect((shopNpc) => {
      this._bindShopNpc(shopNpc);
    });
  }

  /**
   * サービス停止時の処理
   * - 監視中のプロンプトの接続をすべてクリーンアップする
   * - ShopNPCタグの追加監視も停止する
   */
  public stop(): void {
    for (const [, connections] of this._boundPrompts) {
      connections.Triggered.Disconnect();
      connections.Destroying.Disconnect();
    }
    this._boundPrompts.clear();

    // ShopNPCタグの追加監視を停止する
    this._shopNpcAddedConnection?.Disconnect();
    this._shopNpcAddedConnection = undefined;
  }

  /**
   * ShopNPCにプロンプトをバインドする
   * @param shopNpc バインド対象のShopNPC
   */
  private _bindShopNpc(shopNpc: Instance): void {
    // すでにプロンプトがバインドされている場合は何もしない
    const prompt = this._resolveOrCreatePrompt(shopNpc);
    if (!prompt) return;

    // すでにこのプロンプトがバインドされている場合は何もしない
    if (this._boundPrompts.has(prompt)) return;

    // プロンプトからShopIdを解決する
    const shopId = this._resolveShopId(shopNpc, prompt);
    if (!shopId) return;

    // プロンプトのTriggeredイベントを監視し、ショップを開くRemoteEventを発火する
    const triggerConnection = prompt.Triggered.Connect((player) => {
      const payload: ShopOpenPayload = {
        ShopId: shopId,
      };

      // プレイヤーにショップを開くためのRemoteEventを発火する
      this._getOrCreateShopOpenRemote().FireClient(player, payload);
      logger.debug(
        'ShopPrompt',
        `${player.Name} がショップを開いた: shopId=${shopId}`,
      );
    });

    // プロンプトのDestroyingイベントを監視し、接続をクリーンアップする
    let destroyConnection: RBXScriptConnection;

    // プロンプトが破壊されたときに、Triggeredイベントの接続をクリーンアップし、マップから削除する
    destroyConnection = prompt.Destroying.Connect(() => {
      triggerConnection.Disconnect();
      destroyConnection.Disconnect();
      this._boundPrompts.delete(prompt);
    });

    // マップにプロンプトと接続を保存する
    this._boundPrompts.set(prompt, {
      Triggered: triggerConnection,
      Destroying: destroyConnection,
    });
  }

  /**
   * ShopNPCからプロンプトを解決する
   * - ShopNPC自身がProximityPromptであればそれを返す
   * - ShopNPCの子孫にProximityPromptがあればそれを返す
   * - どちらも見つからない場合は、ShopNPCのBasePart（またはPrimaryPart）に新しいProximityPromptを作成して配置する
     - BasePartやPrimaryPartが見つからない場合はプロンプトを配置できないため、undefinedを返す
   * @param shopNpc バインド対象のShopNPC
   * @returns 解決または作成されたProximityPrompt、または配置できない場合はundefined
   */
  private _resolveOrCreatePrompt(
    shopNpc: Instance,
  ): ProximityPrompt | undefined {
    // ShopNPC自身がProximityPromptであればそれを返す
    if (shopNpc.IsA('ProximityPrompt')) return shopNpc;

    // ShopNPCの子孫にProximityPromptがあればそれを返す
    const existingPrompt = shopNpc.FindFirstChildWhichIsA(
      'ProximityPrompt',
      true,
    );
    // すでにプロンプトが存在する場合はそれを返す
    if (existingPrompt) return existingPrompt;

    // ShopNPCのBasePart（またはPrimaryPart）に新しいProximityPromptを作成して配置する
    const parentPart = this._resolvePromptParent(shopNpc);
    if (!parentPart) {
      logger.warn(
        'ShopPrompt',
        `ShopNPCにProximityPromptを配置できません: ${shopNpc.GetFullName()}`,
      );
      return undefined;
    }

    // ProximityPromptに各種設定して作成、配置する
    const prompt = new Instance('ProximityPrompt');
    prompt.ActionText = 'ショップを開く';
    prompt.ObjectText = shopNpc.Name;
    prompt.MaxActivationDistance = 10;
    prompt.RequiresLineOfSight = false;
    prompt.Parent = parentPart;

    return prompt;
  }

  /**
   * ShopNPCからプロンプトの親となるBasePartを解決する
   * - ShopNPC自身がBasePartであればそれを返す
   * - ShopNPCがModelであれば、PrimaryPartを優先して返す。PrimaryPartがない場合は子孫のBasePartを返す
   * - どちらも見つからない場合はundefinedを返す
   * @param shopNpc バインド対象のShopNPC
   * @returns プロンプトの親となるBasePart、または見つからない場合はundefined
   */
  private _resolvePromptParent(shopNpc: Instance): BasePart | undefined {
    if (shopNpc.IsA('BasePart')) return shopNpc;

    if (shopNpc.IsA('Model')) {
      if (shopNpc.PrimaryPart) return shopNpc.PrimaryPart;
      return shopNpc.FindFirstChildWhichIsA('BasePart', true);
    }

    return undefined;
  }

  /**
   * ShopIdを解決する
   * - ShopNPCとProximityPromptの両方からShopId属性を探す
   * - どちらも見つからない場合はundefinedを返す
   * @param shopNpc バインド対象のShopNPC
   * @param prompt バインド対象のProximityPrompt
   * @returns 解決されたShopId、または見つからない場合はundefined
   */
  private _resolveShopId(
    shopNpc: Instance,
    prompt: ProximityPrompt,
  ): ShopId | undefined {
    // ShopNPCとProximityPromptの両方からShopId属性を探す
    const candidates = [
      shopNpc.GetAttribute(ATTRIBUTES.ShopId),
      prompt.GetAttribute(ATTRIBUTES.ShopId),
    ];

    // 候補の中から有効なShopIdを返す
    for (const candidate of candidates) {
      if (isShopId(candidate)) {
        return candidate;
      }
    }

    logger.warn(
      'ShopPrompt',
      `ShopId属性が未設定または不正です: ${shopNpc.GetFullName()} / ${prompt.GetFullName()}`,
    );
    return undefined;
  }

  /**
   * ショップを開くためのRemoteEventを取得または作成する
   * - RemoteEventはReplicatedStorage内の特定のフォルダに配置される
   * - 既に存在する場合はそれを再利用し、存在しない場合は新規作成する
   */
  private _getOrCreateShopOpenRemote(): RemoteEvent {
    let folder = ReplicatedStorage.FindFirstChild(REMOTES.FolderName);
    if (!folder) {
      folder = new Instance('Folder');
      folder.Name = REMOTES.FolderName;
      folder.Parent = ReplicatedStorage;
    }

    // 既にRemoteEventが存在する場合はそれを返す
    const remote = folder.FindFirstChild(REMOTES.Shop_open);
    if (remote?.IsA('RemoteEvent')) {
      return remote;
    }

    // RemoteEventが存在しない場合は新規作成して返す
    const created = new Instance('RemoteEvent');
    created.Name = REMOTES.Shop_open;
    created.Parent = folder;
    return created;
  }
}

export const shopPromptService = new ShopPromptService();
