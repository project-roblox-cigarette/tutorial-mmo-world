/**
 * 武器システム関連の型定義
 */

/**
 * 武器の識別子
 */
export type WeaponId = 'Sword_Lv0' | 'Sword_Lv1' | 'Sword_Lv2' | 'Sword_Lv3';

/**
 * 武器の設定
 */
export type WeaponConfig = {
  /** 武器ID */
  Id: WeaponId;
  /** ダメージ量 */
  Damage: number;
  /** 判定ボックスの厚み */
  HitboxThickness: number;
  /** 1回の振りで当たる最大敵数 */
  MaxHitsPerSwing: number;
  /** 攻撃のクールダウン時間（秒） */
  CooldownSec: number;
  /** 判定開始タイミング（秒） */
  HitStartSec: number;
  /** 判定終了タイミング（秒） */
  HitEndSec: number;
  /** 判定サンプリング間隔（秒） */
  HitSampleIntervalSec: number;
};
