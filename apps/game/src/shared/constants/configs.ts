/**
 * ゲーム基本設定定数
 */
export const CONFIGS = {
  Game: {
    /** サーバーの最大プレイヤー数 */
    MaxPlayers: 50,
    /** ゲームのティックレート（FPS） */
    TickRate: 60,
  },
  Spawn: {
    /** デフォルトのスポーン位置 */
    DefaultPosition: new Vector3(0, 10, 0),
    /** リスポーンまでの遅延時間（秒） */
    RespawnDelay: 5,
  },
  Combat: {
    /** 攻撃のクールダウン時間（秒） */
    SwingCooldownSec: 0.5,
  },
} as const;
