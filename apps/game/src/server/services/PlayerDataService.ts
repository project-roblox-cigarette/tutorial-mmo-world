// プレイヤーデータ管理サービス

import type { PlayerData } from 'shared/types/player';
import { getCurrentTimestamp } from 'shared/utils';

// プレイヤーデータのメモリキャッシュ
const playerDataCache = new Map<number, PlayerData>();

/**
 * プレイヤーデータを初期化
 */
export function initializePlayerData(player: Player): PlayerData {
  const data: PlayerData = {
    userId: player.UserId,
    displayName: player.DisplayName,
    joinedAt: getCurrentTimestamp(),
    score: 0,
    level: 1,
  };

  playerDataCache.set(player.UserId, data);
  return data;
}

/**
 * プレイヤーデータを取得
 */
export function getPlayerData(userId: number): PlayerData | undefined {
  return playerDataCache.get(userId);
}

/**
 * プレイヤーデータを更新
 */
export function updatePlayerData(
  userId: number,
  updates: Partial<Omit<PlayerData, 'userId' | 'joinedAt'>>,
): PlayerData | undefined {
  const existing = playerDataCache.get(userId);
  if (!existing) return undefined;

  const updated: PlayerData = {
    ...existing,
    ...updates,
  };
  playerDataCache.set(userId, updated);
  return updated;
}

/**
 * プレイヤーデータを削除（退出時）
 */
export function removePlayerData(userId: number): boolean {
  return playerDataCache.delete(userId);
}

/**
 * 全プレイヤーデータを取得
 */
export function getAllPlayerData(): PlayerData[] {
  const result: PlayerData[] = [];
  playerDataCache.forEach((data) => {
    result.push(data);
  });
  return result;
}

/**
 * プレイヤー数を取得
 */
export function getPlayerCount(): number {
  return playerDataCache.size();
}
