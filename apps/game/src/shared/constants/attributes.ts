/**
 * Instance属性名の定数
 * Robloxオブジェクトの属性として使用される文字列キー
 */
export const ATTRS = {
  // === Enemy関連の属性 ===
  /** 敵の追跡範囲（AggroRange） */
  AGGRO_RANGE: 'AggroRange',
  /** 敵の停止距離（StopDistance） */
  STOP_DISTANCE: 'StopDistance',
  /** 敵の追跡速度（ChaseSpeed） */
  CHASE_SPEED: 'ChaseSpeed',
  /** 敵の追跡更新間隔（ChaseTick） */
  CHASE_TICK: 'ChaseTick',
  /** 敵の過去位置追尾遅延時間（FollowLagSec） */
  FOLLOW_LAG_SEC: 'FollowLagSec',
  /** 敵が近づいたときの一時停止時間（StopDurationSec） */
  STOP_DURATION_SEC: 'StopDurationSec',
  /** 敵の死亡フラグ（Dead） */
  DEAD: 'Dead',
  /** 敵の体力（HP） */
  HP: 'HP',
  /** 敵の所有者ユーザーID（OwnerUserId） */
  OWNER_USER_ID: 'OwnerUserId',

  // === Area関連の属性 ===
  /** エリアID（AreaId） */
  AREA_ID: 'AreaId',
  /** エリアレベル（Level） */
  AREA_LEVEL: 'Level',

  // === Teleport関連の属性 ===
  /** テレポート先の場所キー（Destination） */
  DESTINATION: 'Destination',
  /** テレポート元の場所キー（PlaceKey） */
  PLACE_KEY: 'PlaceKey',
} as const;
