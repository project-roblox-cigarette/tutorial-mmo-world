import type { WeaponConfig, WeaponId } from '../types/weapon';

/**
 * 武器カタログ
 * 全ての武器の設定値を定義
 */
export const WEAPON_CATALOG: Record<WeaponId, WeaponConfig> = {
  Sword_Lv0: {
    id: 'Sword_Lv0', // 剣_レベル0
    damage: 9999, // ダメージ
    hitboxThickness: 3.0, // ヒットボックスの厚み
    maxHitsPerSwing: 2, // 一回の攻撃で最大ヒット数
    cooldownSec: 0.5, // 攻撃クールダウン
    hitStartSec: 0.1, // 攻撃開始時間
    hitEndSec: 0.4, // 攻撃終了時間
    hitSampleIntervalSec: 0.03, // ヒットサンプリング間隔
  },
  Sword_Lv1: {
    id: 'Sword_Lv1', // 剣_レベル1
    damage: 9999, // ダメージ
    hitboxThickness: 1.2, // ヒットボックスの厚み
    maxHitsPerSwing: 2, // 一回の攻撃で最大ヒット数
    cooldownSec: 0.5, // 攻撃クールダウン
    hitStartSec: 0.1, // 攻撃開始時間
    hitEndSec: 0.4, // 攻撃終了時間
    hitSampleIntervalSec: 0.03, // ヒットサンプリング間隔
  },
  Sword_Lv2: {
    id: 'Sword_Lv2', // 剣_レベル2
    damage: 9999, // ダメージ
    hitboxThickness: 1.2, // ヒットボックスの厚み
    maxHitsPerSwing: 2, // 一回の攻撃で最大ヒット数
    cooldownSec: 0.5, // 攻撃クールダウン
    hitStartSec: 0.1, // 攻撃開始時間
    hitEndSec: 0.4, // 攻撃終了時間
    hitSampleIntervalSec: 0.03, // ヒットサンプリング間隔
  },
  Sword_Lv3: {
    id: 'Sword_Lv3', // 剣_レベル3
    damage: 9999, // ダメージ
    hitboxThickness: 1.2, // ヒットボックスの厚み
    maxHitsPerSwing: 2, // 一回の攻撃で最大ヒット数
    cooldownSec: 0.5, // 攻撃クールダウン
    hitStartSec: 0.1, // 攻撃開始時間
    hitEndSec: 0.4, // 攻撃終了時間
    hitSampleIntervalSec: 0.03, // ヒットサンプリング間隔
  },
} as const;
