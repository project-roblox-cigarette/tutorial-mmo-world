import { CollectionService, ReplicatedStorage } from '@rbxts/services';
import { ATTRIBUTES, REMOTES, TAGS } from 'shared/constants';
import { isShopId, type ShopId, type ShopOpenPayload } from 'shared/types/shop';
import { logger } from 'shared/utils/logger';
import { BaseService } from '../../../core/Service';

type BoundPromptConnections = {
  Triggered: RBXScriptConnection;
  Destroying: RBXScriptConnection;
};

export class ShopPromptService extends BaseService {
  private readonly _boundPrompts = new Map<
    ProximityPrompt,
    BoundPromptConnections
  >();
  private _shopNpcAddedConnection?: RBXScriptConnection;

  constructor() {
    super('ShopPrompt');
  }

  public start(): void {
    super.start();

    this._getOrCreateShopOpenRemote();

    const shopNpcs = CollectionService.GetTagged(TAGS.SHOP_NPC);
    logger.info('ShopPrompt', `ShopNPCタグを ${shopNpcs.size()} 件検出`);

    for (const shopNpc of shopNpcs) {
      this._bindShopNpc(shopNpc);
    }

    this._shopNpcAddedConnection = CollectionService.GetInstanceAddedSignal(
      TAGS.SHOP_NPC,
    ).Connect((shopNpc) => {
      this._bindShopNpc(shopNpc);
    });
  }

  public stop(): void {
    for (const [, connections] of this._boundPrompts) {
      connections.Triggered.Disconnect();
      connections.Destroying.Disconnect();
    }
    this._boundPrompts.clear();

    this._shopNpcAddedConnection?.Disconnect();
    this._shopNpcAddedConnection = undefined;
  }

  private _bindShopNpc(shopNpc: Instance): void {
    const prompt = this._resolveOrCreatePrompt(shopNpc);
    if (!prompt) return;

    if (this._boundPrompts.has(prompt)) return;

    const shopId = this._resolveShopId(shopNpc, prompt);
    if (!shopId) return;

    const triggerConnection = prompt.Triggered.Connect((player) => {
      const payload: ShopOpenPayload = {
        ShopId: shopId,
      };

      this._getOrCreateShopOpenRemote().FireClient(player, payload);
      logger.debug(
        'ShopPrompt',
        `${player.Name} がショップを開いた: shopId=${shopId}`,
      );
    });

    let destroyConnection: RBXScriptConnection;
    destroyConnection = prompt.Destroying.Connect(() => {
      triggerConnection.Disconnect();
      destroyConnection.Disconnect();
      this._boundPrompts.delete(prompt);
    });

    this._boundPrompts.set(prompt, {
      Triggered: triggerConnection,
      Destroying: destroyConnection,
    });
  }

  private _resolveOrCreatePrompt(
    shopNpc: Instance,
  ): ProximityPrompt | undefined {
    if (shopNpc.IsA('ProximityPrompt')) return shopNpc;

    const existingPrompt = shopNpc.FindFirstChildWhichIsA(
      'ProximityPrompt',
      true,
    );
    if (existingPrompt) return existingPrompt;

    const parentPart = this._resolvePromptParent(shopNpc);
    if (!parentPart) {
      logger.warn(
        'ShopPrompt',
        `ShopNPCにProximityPromptを配置できません: ${shopNpc.GetFullName()}`,
      );
      return undefined;
    }

    const prompt = new Instance('ProximityPrompt');
    prompt.ActionText = 'ショップを開く';
    prompt.ObjectText = shopNpc.Name;
    prompt.MaxActivationDistance = 10;
    prompt.RequiresLineOfSight = false;
    prompt.Parent = parentPart;

    return prompt;
  }

  private _resolvePromptParent(shopNpc: Instance): BasePart | undefined {
    if (shopNpc.IsA('BasePart')) return shopNpc;

    if (shopNpc.IsA('Model')) {
      if (shopNpc.PrimaryPart) return shopNpc.PrimaryPart;
      return shopNpc.FindFirstChildWhichIsA('BasePart', true);
    }

    return undefined;
  }

  private _resolveShopId(
    shopNpc: Instance,
    prompt: ProximityPrompt,
  ): ShopId | undefined {
    const candidates = [
      shopNpc.GetAttribute(ATTRIBUTES.ShopId),
      prompt.GetAttribute(ATTRIBUTES.ShopId),
    ];

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

  private _getOrCreateShopOpenRemote(): RemoteEvent {
    let folder = ReplicatedStorage.FindFirstChild(REMOTES.FolderName);
    if (!folder) {
      folder = new Instance('Folder');
      folder.Name = REMOTES.FolderName;
      folder.Parent = ReplicatedStorage;
    }

    const remote = folder.FindFirstChild(REMOTES.Shop_open);
    if (remote?.IsA('RemoteEvent')) {
      return remote;
    }

    const created = new Instance('RemoteEvent');
    created.Name = REMOTES.Shop_open;
    created.Parent = folder;
    return created;
  }
}

export const shopPromptService = new ShopPromptService();
