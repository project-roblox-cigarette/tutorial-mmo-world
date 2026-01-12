// ゲーム全体の定数定義
// クライアント・サーバー両方で使用

// ゲーム設定
export const GAME_CONFIG = {
  MAX_PLAYERS: 50,
  TICK_RATE: 60,
} as const;

// スポーン設定
export const SPAWN_CONFIG = {
  DEFAULT_POSITION: new Vector3(0, 10, 0),
  RESPAWN_DELAY: 5,
} as const;

// ネットワークイベント名
export const REMOTE_EVENTS = {
  PLAYER_ACTION: 'PlayerAction',
  SYNC_STATE: 'SyncState',
} as const;

export const TAG_ENEMY = 'Enemy' as const;

export const ATTR_AGGRO_RANGE = 'AggroRange' as const;
export const ATTR_STOP_RANGE = 'StopDistance' as const;
export const ATTR_CHASE_SPEED = 'ChaseSpeed' as const;
export const ATTR_WALK_TICK = 'ChaseTick' as const;
