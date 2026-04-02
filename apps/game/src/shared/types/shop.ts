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
