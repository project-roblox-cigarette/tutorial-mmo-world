import type {
  ShopConfig,
  ShopId,
  ShopItemConfig,
  ShopItemId,
} from '../types/shop';

/**
 * ショップ商品カタログ
 */
export const SHOP_ITEM_CATALOG: Record<ShopItemId, ShopItemConfig> = {
  Sword_Lv0: {
    Id: 'Sword_Lv0',
    DisplayName: '剣',
    ToolTemplateName: 'Sword_Lv0',
    Price: 100,
  },
  FishingRod_Lv0: {
    Id: 'FishingRod_Lv0',
    DisplayName: '釣り竿',
    ToolTemplateName: 'FishingRod_Lv0',
    Price: 80,
  },
} as const;

/**
 * 店の設定
 */
export const SHOP_CONFIGS: Record<ShopId, ShopConfig> = {
  ToolShop: {
    Id: 'ToolShop',
    DisplayName: '道具屋',
    Items: ['Sword_Lv0', 'FishingRod_Lv0'],
  },
} as const;
