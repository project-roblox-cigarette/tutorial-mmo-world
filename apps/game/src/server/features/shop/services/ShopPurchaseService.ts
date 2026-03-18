import { ReplicatedStorage, ServerStorage } from '@rbxts/services';
import { REMOTES } from 'shared/constants';
import { SHOP_CONFIGS, SHOP_ITEM_CATALOG } from 'shared/constants/shops';
import {
  isShopPurchaseRequest,
  type ShopItemConfig,
  type ShopPurchaseError,
  type ShopPurchaseResult,
} from 'shared/types/shop';
import { logger } from 'shared/utils/logger';
import { BaseService } from '../../../core/Service';
import { canAfford, spendMoney } from '../../player/services/MoneyService';

/**
 * ショップ購入サービス
 * - クライアントからの購入リクエストを処理し、アイテムの販売と所持金の管理を行う
 * - 購入リクエストは RemoteFunction を通じて受け取る
 * - 購入処理の結果は ShopPurchaseResult 型でクライアントに返す
 */
export class ShopPurchaseService extends BaseService {
  constructor() {
    super('ShopPurchase');
  }

  /**
   * サービス開始時に RemoteFunction をセットアップし、購入リクエストのハンドラを登録する
   */
  public start(): void {
    super.start();

    // RemoteFunction を取得または作成し、OnServerInvoke にハンドラを登録
    const remote = this.getOrCreateShopPurchaseRemote();

    // 既にハンドラが登録されている場合は上書きする前に警告を出す
    remote.OnServerInvoke = (player, payload: unknown) => {
      return this.handlePurchase(player, payload);
    };
  }

  /**
   * サービス停止時に RemoteFunction のハンドラを解除する
   */
  public stop(): void {
    const remote = this.getOrCreateShopPurchaseRemote();
    remote.OnServerInvoke = undefined;
  }

  /**
   * RemoteFunction を取得するか、存在しない場合は作成する
   * @returns RemoteFunction インスタンス
   */
  private getOrCreateShopPurchaseRemote(): RemoteFunction {
    let folder = ReplicatedStorage.FindFirstChild(REMOTES.FolderName);
    if (!folder) {
      folder = new Instance('Folder');
      folder.Name = REMOTES.FolderName;
      folder.Parent = ReplicatedStorage;
    }

    const remote = folder.FindFirstChild(REMOTES.Shop_purchase);
    if (remote?.IsA('RemoteFunction')) {
      return remote;
    }

    const created = new Instance('RemoteFunction');
    created.Name = REMOTES.Shop_purchase;
    created.Parent = folder;
    return created;
  }

  /**
   * 購入失敗時のレスポンスを生成する
   * @param purchaseError エラーの種類
   * @returns ShopPurchaseResult 型の失敗レスポンス
   */
  private failure(purchaseError: ShopPurchaseError): ShopPurchaseResult {
    return {
      Success: false,
      Error: purchaseError,
    };
  }

  /**
   * 商品定義から Tool テンプレートを取得する
   * @param itemConfig 購入対象アイテムの設定
   * @returns Tool テンプレート。見つからない場合は undefined
   */
  private getToolTemplate(itemConfig: ShopItemConfig): Tool | undefined {
    const weaponsFolder = ServerStorage.FindFirstChild('Weapons');
    if (!weaponsFolder) return undefined;

    if (!itemConfig.StorageCategory) return undefined;

    const categoryFolder = weaponsFolder.FindFirstChild(
      itemConfig.StorageCategory,
    );
    if (!categoryFolder) return undefined;

    const toolTemplate = categoryFolder.FindFirstChild(
      itemConfig.ToolTemplateName,
    );
    if (!toolTemplate || !toolTemplate.IsA('Tool')) {
      return undefined;
    }

    return toolTemplate;
  }

  /**
   * 購入リクエストを処理する
   * @param player 購入リクエストを送信したプレイヤー
   * @param payload 購入リクエストのペイロード
   * @returns ShopPurchaseResult 型の購入結果
   */
  private handlePurchase(player: Player, payload: unknown): ShopPurchaseResult {
    // ペイロードの型を検証
    if (!isShopPurchaseRequest(payload)) {
      return this.failure('InvalidItem');
    }

    // ショップとアイテムの存在、販売状況、価格の検証
    const shopConfig = SHOP_CONFIGS[payload.ShopId];
    if (!shopConfig) {
      return this.failure('InvalidShop');
    }

    // アイテムの存在と価格の検証
    const itemConfig = SHOP_ITEM_CATALOG[payload.ItemId];
    if (!itemConfig) {
      return this.failure('InvalidItem');
    }

    // アイテムがそのショップで販売されているかの検証
    if (!shopConfig.Items.includes(payload.ItemId)) {
      return this.failure('ItemNotSoldInShop');
    }

    const toolTemplate = this.getToolTemplate(itemConfig);

    // Toolテンプレートの存在の検証
    if (!toolTemplate) {
      return this.failure('ToolTemplateNotFound');
    }

    // プレイヤーがアイテムを購入できるかの検証（所持金の確認）
    if (!canAfford(player, itemConfig.Price)) {
      return this.failure('InsufficientFunds');
    }

    // プレイヤーのインベントリ（Backpack）を取得、存在するか確認
    const backpack = player.FindFirstChildOfClass('Backpack');
    if (!backpack) {
      return this.failure('InventoryAddFailed');
    }

    // 所持金を減らす処理とアイテムをプレイヤーのインベントリに追加する処理
    const spendResult = spendMoney(player, itemConfig.Price);
    if (!spendResult.Success) {
      if (spendResult.Error === 'InsufficientFunds') {
        return this.failure('InsufficientFunds');
      }
      return this.failure('InventoryAddFailed');
    }

    // アイテムをプレイヤーのインベントリに追加する
    const tool = toolTemplate.Clone();
    tool.Parent = backpack;

    logger.info(
      'ShopPurchase',
      `購入成功: player=${player.Name} shopId=${payload.ShopId} itemId=${payload.ItemId} price=${itemConfig.Price} remaining=${spendResult.Value}`,
    );

    // 購入成功のレスポンスを返す
    return {
      Success: true,
      ItemId: payload.ItemId,
      RemainingMoney: spendResult.Value,
    };
  }
}

export const shopPurchaseService = new ShopPurchaseService();
