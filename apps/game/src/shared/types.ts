// ゲーム内共通型定義

/**
 * ゲーム内プレイヤーデータ
 */
export interface PlayerData {
  userId: number;
  displayName: string;
  joinedAt: number;
  score: number;
  level: number;
}

/**
 * スコア更新の種類
 */
export type ScoreUpdateType = 'add' | 'subtract' | 'set';

/**
 * リーダーボードエントリー
 */
export interface LeaderboardEntry {
  userId: number;
  displayName: string;
  score: number;
  rank: number;
}
