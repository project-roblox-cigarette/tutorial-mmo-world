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
 * 店設定（将来、複数店に拡張する前提で型を切る）
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
 * 文字列の型ガード（Remote入力検証で使う）
 */
export function isShopId(value: unknown): value is ShopId {
  return typeIs(value, 'string') && value === 'ToolShop';
}

export function isShopItemId(value: unknown): value is ShopItemId {
  if (!typeIs(value, 'string')) return false;
  return value === 'Sword_Lv0' || value === 'FishingRod_Lv0';
}
