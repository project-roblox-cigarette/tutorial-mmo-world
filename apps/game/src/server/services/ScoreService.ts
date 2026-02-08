/**
 * スコア管理サービス
 * - スコアの加算・減算・設定
 * - レベル計算
 * - リーダーボード生成
 */

import type { LeaderboardEntry, ScoreUpdateType } from 'shared/types/player';
import { logger } from 'shared/utils/logger';
import { clamp } from 'shared/utils/math';
import { LEVEL_THRESHOLDS, SCORES } from '../../shared/constants/scores';
import {
  getAllPlayerData,
  getPlayerData,
  updatePlayerData,
} from './PlayerDataService';

/**
 * スコアからレベルを計算
 * @param score 現在のスコア
 * @returns 計算されたレベル
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
 * @param currentLevel 現在のレベル
 * @returns 次のレベルに必要なスコア、最大レベル到達時はundefined
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
 * @param userId ユーザーID
 * @param amount 変更量または設定値
 * @param updateType 更新タイプ（add, subtract, set）
 * @returns 更新後のスコア、プレイヤーが見つからない場合はundefined
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
      newScore = playerData.Score + amount;
      break;
    case 'subtract':
      newScore = playerData.Score - amount;
      break;
    case 'set':
      newScore = amount;
      break;
  }

  newScore = clamp(newScore, SCORES.Min, SCORES.Max);
  const newLevel = calculateLevel(newScore);

  const previousLevel = playerData.Level;
  updatePlayerData(userId, { Score: newScore, Level: newLevel });

  // レベルアップ検知
  if (newLevel > previousLevel) {
    logger.info(
      'ScoreService',
      `プレイヤー ${userId} がレベル ${newLevel} に上昇しました！`,
    );
  }

  return newScore;
}

/**
 * プレイヤーのスコアを取得
 * @param userId ユーザーID
 * @returns スコア、プレイヤーが見つからない場合はundefined
 */
export function getScore(userId: number): number | undefined {
  return getPlayerData(userId)?.Score;
}

/**
 * リーダーボードを取得（上位N人）
 * @param limit 取得する上位人数（デフォルト: 10）
 * @returns リーダーボードエントリーの配列
 */
export function getLeaderboard(limit: number = 10): LeaderboardEntry[] {
  const allPlayerData = getAllPlayerData();

  // スコア降順でソート
  allPlayerData.sort((a, b) => a.Score < b.Score);

  // 上位N人を取得
  const topPlayers = allPlayerData.filter(
    (_playerData, index) => index < limit,
  );

  return topPlayers.map((playerData, index) => ({
    UserId: playerData.UserId,
    DisplayName: playerData.DisplayName,
    Score: playerData.Score,
    Rank: index + 1,
  }));
}
