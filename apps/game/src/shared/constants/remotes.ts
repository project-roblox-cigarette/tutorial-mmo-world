/**
 * RemoteEvent/RemoteFunction名の定数
 * クライアント-サーバー間通信で使用
 */
export const REMOTES = {
  /** Remotesフォルダ名（ReplicatedStorage配下） */
  FolderName: 'Remotes',
  /** 近接攻撃のRemoteEvent名 */
  MeleeAttack: 'MeleeAttack',
  /** プレイヤーアクションのRemoteEvent名（汎用） */
  PlayerAction: 'PlayerAction',
  /** 状態同期のRemoteEvent名 */
  SyncState: 'SyncState',
} as const;
