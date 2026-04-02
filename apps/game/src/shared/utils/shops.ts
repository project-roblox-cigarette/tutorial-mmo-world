/**
 * ショップ関連のユーティリティ
 */
import { SHOP_CONFIGS, SHOP_ITEM_CATALOG } from '../constants';
import type { ShopId, ShopItemId } from '../types/shop';

/**
 * 店設定を取得する
 * @param shopId 店ID
 * @returns 店設定
 */
export function getShopConfig(shopId: ShopId) {
  return SHOP_CONFIGS[shopId];
}

/**
 * 商品設定を取得する
 * @param itemId 商品ID
 * @returns 商品設定
 */
export function getShopItemConfig(itemId: ShopItemId) {
  return SHOP_ITEM_CATALOG[itemId];
}
