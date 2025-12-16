// スコア管理サービス

import type { LeaderboardEntry, ScoreUpdateType } from 'shared/types';
import { clamp } from 'shared/utils';
import {
  getAllPlayerData,
  getPlayerData,
  updatePlayerData,
} from './PlayerDataService';

// スコアの制限値
const MIN_SCORE = 0;
const MAX_SCORE = 999999;

// レベルアップに必要なスコア
const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

/**
 * スコアからレベルを計算
 */
export function calculateLevel(score: number): number {
  for (let i = LEVEL_THRESHOLDS.size() - 1; i >= 0; i--) {
    if (score >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * 次のレベルに必要なスコアを取得
 */
export function getScoreForNextLevel(currentLevel: number): number | undefined {
  const nextThresholdIndex = currentLevel;
  if (nextThresholdIndex >= LEVEL_THRESHOLDS.size()) {
    return undefined; // 最大レベル到達
  }
  return LEVEL_THRESHOLDS[nextThresholdIndex];
}

/**
 * プレイヤーのスコアを更新
 */
export function updateScore(
  userId: number,
  amount: number,
  updateType: ScoreUpdateType,
): number | undefined {
  const playerData = getPlayerData(userId);
  if (!playerData) return undefined;

  let newScore: number;
  switch (updateType) {
    case 'add':
      newScore = playerData.score + amount;
      break;
    case 'subtract':
      newScore = playerData.score - amount;
      break;
    case 'set':
      newScore = amount;
      break;
  }

  newScore = clamp(newScore, MIN_SCORE, MAX_SCORE);
  const newLevel = calculateLevel(newScore);

  const previousLevel = playerData.level;
  updatePlayerData(userId, { score: newScore, level: newLevel });

  // レベルアップ検知
  if (newLevel > previousLevel) {
    print(
      `[ScoreService] プレイヤー ${userId} がレベル ${newLevel} に上昇しました！`,
    );
  }

  return newScore;
}

/**
 * プレイヤーのスコアを取得
 */
export function getScore(userId: number): number | undefined {
  return getPlayerData(userId)?.score;
}

/**
 * リーダーボードを取得（上位N人）
 */
export function getLeaderboard(limit: number = 10): LeaderboardEntry[] {
  const allData = getAllPlayerData();

  // スコア降順でソート
  allData.sort((a, b) => a.score < b.score);

  // 上位N人を取得
  const topPlayers = allData.filter((_, i) => i < limit);

  return topPlayers.map((data, index) => ({
    userId: data.userId,
    displayName: data.displayName,
    score: data.score,
    rank: index + 1,
  }));
}
