/**
 * ショップシステム関連の型定義
 */

export type ShopId = 'ToolShop';

/**
 * 商品ID（Toolテンプレ名と揃えるのが運用上ラク）
 */
export type ShopItemId = 'Sword_Lv0' | 'FishingRod_Lv0';

/**
 * 商品設定
 */
export type ShopItemConfig = {
  /** 商品ID */
  Id: ShopItemId;
  /** 表示名（UI用） */
  DisplayName: string;
  /** ServerStorage に配置する Tool テンプレ名 */
  ToolTemplateName: string;
  /** 価格（ゲーム内通貨） */
  Price: number;
};

/**
 * 店設定
 * - Items はこの店で売る商品のIDリスト。
 * - 商品詳細は SHOP_ITEM_CATALOG から参照する。
 */
export type ShopConfig = {
  Id: ShopId;
  DisplayName: string;
  Items: ShopItemId[];
};

/**
 * UIオープン（サーバ→クライアント）
 * PR1は配置+オープンのみ。売買リクエスト型はPR2/PR3で追加する。
 */
export type ShopOpenPayload = {
  ShopId: ShopId;
};

/**
 * 文字列の型ガード
 * @param value 検証する値
 * @returns value が ShopId 型である場合は true、それ以外は false
 */
export function isShopId(value: unknown): value is ShopId {
  return typeIs(value, 'string') && value === 'ToolShop';
}

/**
 * 文字列の型ガード
 * @param value 検証する値
 * @returns value が ShopItemId 型である場合は true、それ以外は false
 */
export function isShopItemId(value: unknown): value is ShopItemId {
  if (!typeIs(value, 'string')) return false;
  return value === 'Sword_Lv0' || value === 'FishingRod_Lv0';
}

/**
 * 購入リクエスト（クライアント→サーバ）
 * 価格は送らない。サーバ側で商品IDから価格を参照して検証する。
 */
export type ShopPurchaseRequest = {
  ShopId: ShopId;
  ItemId: ShopItemId;
};

/**
 * 購入エラーの種類
 * - InvalidShop: 存在しない店
 * - InvalidItem: 存在しない商品
 * - ItemNotSoldInShop: 商品は存在するがその店では売っていない
 * - InsufficientFunds: プレイヤーの所持金が足りない
 * - ToolTemplateNotFound: サーバのServerStorageにToolテンプレートが見つからない
 * - InventoryAddFailed: 購入処理は成功したが、何らかの理由でプレイヤーのインベントリにアイテムを追加できなかった
 */
export type ShopPurchaseError =
  | 'InvalidShop'
  | 'InvalidItem'
  | 'ItemNotSoldInShop'
  | 'InsufficientFunds'
  | 'ToolTemplateNotFound'
  | 'InventoryAddFailed';

/**
 * 購入レスポンス
 * Success: true の場合は購入成功、false の場合はエラーとその理由を含む
 */
export type ShopPurchaseResult =
  | { Success: true; ItemId: ShopItemId; RemainingMoney: number }
  | { Success: false; Error: ShopPurchaseError };

/**
 * 購入リクエストの型ガード
 * @param value 検証する値
 * @returns value が ShopPurchaseRequest 型である場合は true、それ以外は false
 */
export function isShopPurchaseRequest(
  value: unknown,
): value is ShopPurchaseRequest {
  if (!typeIs(value, 'table')) return false;

  const payload = value as Partial<ShopPurchaseRequest>;
  return isShopId(payload.ShopId) && isShopItemId(payload.ItemId);
}
