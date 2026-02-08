/**
 * プレイヤーデータ
 * サーバー側でメモリキャッシュされるプレイヤー情報
 */
export type PlayerData = {
  /** ユーザーID（Robloxのユーザー識別子） */
  UserId: number;
  /** 表示名 */
  DisplayName: string;
  /** 参加時刻（Unixタイムスタンプ） */
  JoinedAt: number;
  /** スコア */
  Score: number;
  /** レベル */
  Level: number;
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
  UserId: number;
  /** 表示名 */
  DisplayName: string;
  /** スコア */
  Score: number;
  /** 順位 */
  Rank: number;
};
