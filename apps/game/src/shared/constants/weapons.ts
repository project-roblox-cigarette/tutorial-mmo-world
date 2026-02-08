import type { WeaponConfig, WeaponId } from '../types/weapon';

/**
 * 武器カタログ
 * 全ての武器の設定値を定義
 */
export const WEAPON_CATALOG: Record<WeaponId, WeaponConfig> = {
  Sword_Lv0: {
    Id: 'Sword_Lv0', // 剣_レベル0
    Damage: 9999, // ダメージ
    HitboxThickness: 3.0, // ヒットボックスの厚み
    MaxHitsPerSwing: 2, // 一回の攻撃で最大ヒット数
    CooldownSec: 0.5, // 攻撃クールダウン
    HitStartSec: 0.1, // 攻撃開始時間
    HitEndSec: 0.4, // 攻撃終了時間
    HitSampleIntervalSec: 0.03, // ヒットサンプリング間隔
  },
  Sword_Lv1: {
    Id: 'Sword_Lv1', // 剣_レベル1
    Damage: 9999, // ダメージ
    HitboxThickness: 1.2, // ヒットボックスの厚み
    MaxHitsPerSwing: 2, // 一回の攻撃で最大ヒット数
    CooldownSec: 0.5, // 攻撃クールダウン
    HitStartSec: 0.1, // 攻撃開始時間
    HitEndSec: 0.4, // 攻撃終了時間
    HitSampleIntervalSec: 0.03, // ヒットサンプリング間隔
  },
  Sword_Lv2: {
    Id: 'Sword_Lv2', // 剣_レベル2
    Damage: 9999, // ダメージ
    HitboxThickness: 1.2, // ヒットボックスの厚み
    MaxHitsPerSwing: 2, // 一回の攻撃で最大ヒット数
    CooldownSec: 0.5, // 攻撃クールダウン
    HitStartSec: 0.1, // 攻撃開始時間
    HitEndSec: 0.4, // 攻撃終了時間
    HitSampleIntervalSec: 0.03, // ヒットサンプリング間隔
  },
  Sword_Lv3: {
    Id: 'Sword_Lv3', // 剣_レベル3
    Damage: 9999, // ダメージ
    HitboxThickness: 1.2, // ヒットボックスの厚み
    MaxHitsPerSwing: 2, // 一回の攻撃で最大ヒット数
    CooldownSec: 0.5, // 攻撃クールダウン
    HitStartSec: 0.1, // 攻撃開始時間
    HitEndSec: 0.4, // 攻撃終了時間
    HitSampleIntervalSec: 0.03, // ヒットサンプリング間隔
  },
} as const;
