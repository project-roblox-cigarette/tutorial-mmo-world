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
  id: WeaponId;
  /** ダメージ量 */
  damage: number;
  /** 判定ボックスの厚み */
  hitboxThickness: number;
  /** 1回の振りで当たる最大敵数 */
  maxHitsPerSwing: number;
  /** 攻撃のクールダウン時間（秒） */
  cooldownSec: number;
  /** 判定開始タイミング（秒） */
  hitStartSec: number;
  /** 判定終了タイミング（秒） */
  hitEndSec: number;
  /** 判定サンプリング間隔（秒） */
  hitSampleIntervalSec: number;
};
