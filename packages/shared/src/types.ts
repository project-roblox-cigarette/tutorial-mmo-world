// 共通型定義

/**
 * ゲーム内プレイヤーデータ
 */
export interface PlayerData {
  userId: number;
  displayName: string;
  joinedAt: number;
}

/**
 * RemoteEvent用ペイロード型
 */
export type RemotePayload<T extends string, D = unknown> = {
  type: T;
  data: D;
};
