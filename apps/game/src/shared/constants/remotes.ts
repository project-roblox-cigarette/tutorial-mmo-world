/**
 * RemoteEvent/RemoteFunction名の定数
 * クライアント-サーバー間通信で使用
 */
export const REMOTES = {
  /** Remotesフォルダ名（ReplicatedStorage配下） */
  FOLDER_NAME: 'Remotes',
  /** 近接攻撃のRemoteEvent名 */
  MELEE_ATTACK: 'MeleeAttack',
  /** プレイヤーアクションのRemoteEvent名（汎用） */
  PLAYER_ACTION: 'PlayerAction',
  /** 状態同期のRemoteEvent名 */
  SYNC_STATE: 'SyncState',
} as const;
