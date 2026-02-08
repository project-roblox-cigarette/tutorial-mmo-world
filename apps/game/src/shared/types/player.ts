/**
 * プレイヤーシステム関連の型定義
 */

/**
 * プレイヤーデータ
 * サーバー側でメモリキャッシュされるプレイヤー情報
 */
export type PlayerData = {
  /** ユーザーID（Robloxのユーザー識別子） */
  userId: number;
  /** 表示名 */
  displayName: string;
  /** 参加時刻（Unixタイムスタンプ） */
  joinedAt: number;
  /** スコア */
  score: number;
  /** レベル */
  level: number;
};

/**
 * スコア更新のタイプ
 * - add: 加算
 * - subtract: 減算
 * - set: 設定（上書き）
 */
export type ScoreUpdateType = 'add' | 'subtract' | 'set';

/**
 * リーダーボードのエントリー
 */
export type LeaderboardEntry = {
  /** ユーザーID */
  userId: number;
  /** 表示名 */
  displayName: string;
  /** スコア */
  score: number;
  /** 順位 */
  rank: number;
};
