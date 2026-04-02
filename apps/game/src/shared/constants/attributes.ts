/**
 * Instance属性名の定数
 * Robloxオブジェクトの属性として使用される文字列キー
 */
export const ATTRIBUTES = {
  // === Enemy関連の属性 ===
  /** 敵の追跡範囲（AggroRange） */
  AggroRange: 'AggroRange',
  /** 敵の停止距離（StopDistance） */
  StopDistance: 'StopDistance',
  /** 敵の追跡速度（ChaseSpeed） */
  ChaseSpeed: 'ChaseSpeed',
  /** 敵の追跡更新間隔（ChaseTick） */
  ChaseTick: 'ChaseTick',
  /** 敵の過去位置追尾遅延時間（FollowLagSec） */
  FollowLagSec: 'FollowLagSec',
  /** 敵が近づいたときの一時停止時間（StopDurationSec） */
  StopDurationSec: 'StopDurationSec',
  /** 敵の死亡フラグ（Dead） */
  Dead: 'Dead',
  /** 敵の体力（HP） */
  Hp: 'Hp',
  /** 敵の所有者ユーザーID（OwnerUserId） */
  OwnerUserId: 'OwnerUserId',
  /** 敵のレベル（EnemyLevel） */
  EnemyLevel: 'EnemyLevel',
  /** 敵の死亡処理フラグ（DeathHandled） */
  DeathHandled: 'DeathHandled',

  // === Area関連の属性 ===
  /** エリアID（AreaId） */
  AreaId: 'AreaId',
  /** エリアレベル（Level） */
  AreaLevel: 'Level',

  // === Teleport関連の属性 ===
  /** テレポート先の場所キー（Destination） */
  Destination: 'Destination',
  /** テレポート元の場所キー（PlaceKey） */
  PlaceKey: 'PlaceKey',

  // === SHOP関連の属性 ===
  /** ショップID（ShopId） */
  ShopId: 'ShopId',
} as const;
