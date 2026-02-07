import type { WeaponConfig, WeaponId } from '../types/weapon';

/**
 * 武器カタログ
 * 全ての武器の設定値を定義
 */
export const WEAPON_CATALOG: Record<WeaponId, WeaponConfig> = {
  Sword_Lv0: {
    id: 'Sword_Lv0',
    damage: 9999,
    hitboxThickness: 3.0,
    maxHitsPerSwing: 2,
    cooldownSec: 0.5,
    hitStartSec: 0.1,
    hitEndSec: 0.4,
    hitSampleIntervalSec: 0.03,
  },
  Sword_Lv1: {
    id: 'Sword_Lv1',
    damage: 9999,
    hitboxThickness: 1.2,
    maxHitsPerSwing: 2,
    cooldownSec: 0.5,
    hitStartSec: 0.1,
    hitEndSec: 0.4,
    hitSampleIntervalSec: 0.03,
  },
  Sword_Lv2: {
    id: 'Sword_Lv2',
    damage: 9999,
    hitboxThickness: 1.2,
    maxHitsPerSwing: 2,
    cooldownSec: 0.5,
    hitStartSec: 0.1,
    hitEndSec: 0.4,
    hitSampleIntervalSec: 0.03,
  },
  Sword_Lv3: {
    id: 'Sword_Lv3',
    damage: 9999,
    hitboxThickness: 1.2,
    maxHitsPerSwing: 2,
    cooldownSec: 0.5,
    hitStartSec: 0.1,
    hitEndSec: 0.4,
    hitSampleIntervalSec: 0.03,
  },
};
