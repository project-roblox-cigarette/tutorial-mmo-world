/**
 * ゲーム全体の設定値定数
 * 調整可能なゲームパラメータを定義
 */

/**
 * ゲーム基本設定
 */
export const GAME_CONFIG = {
  /** サーバーの最大プレイヤー数 */
  MAX_PLAYERS: 50,
  /** ゲームのティックレート（FPS） */
  TICK_RATE: 60,
} as const;

/**
 * スポーン設定
 */
export const SPAWN_CONFIG = {
  /** デフォルトのスポーン位置 */
  DEFAULT_POSITION: new Vector3(0, 10, 0),
  /** リスポーンまでの遅延時間（秒） */
  RESPAWN_DELAY: 5,
} as const;

/**
 * 攻撃設定
 */
export const COMBAT_CONFIG = {
  /** 攻撃のクールダウン時間（秒） */
  SWING_COOLDOWN_SEC: 0.5,
} as const;
