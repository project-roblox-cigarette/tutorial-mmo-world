/**
 * プレイヤーデータ管理サービス
 * - メモリ内でプレイヤーデータをキャッシュ
 * - データの初期化、取得、更新、削除を提供
 * - TODO: DataStoreとの連携（保存・読込）
 */

import type { PlayerData } from 'shared/types/player';
import { getCurrentTimestamp } from 'shared/utils/time';

// プレイヤーデータのメモリキャッシュ（userId -> PlayerData）
const playerDataCache = new Map<number, PlayerData>();

/**
 * プレイヤーデータを初期化
 * @param player プレイヤーインスタンス
 * @returns 初期化されたプレイヤーデータ
 */
export function initializePlayerData(player: Player): PlayerData {
  const data: PlayerData = {
    UserId: player.UserId,
    DisplayName: player.DisplayName,
    JoinedAt: getCurrentTimestamp(),
    Score: 0,
    Level: 1,
    Exp: 0,
    ExpInLevel: 0,
    Money: 0,
  };

  playerDataCache.set(player.UserId, data);
  return data;
}

/**
 * プレイヤーデータを取得
 * @param userId ユーザーID
 * @returns プレイヤーデータ、見つからない場合はundefined
 */
export function getPlayerData(userId: number): PlayerData | undefined {
  return playerDataCache.get(userId);
}

/**
 * プレイヤーデータを更新
 * @param userId ユーザーID
 * @param updates 更新する項目（userIdとjoinedAtは除く）
 * @returns 更新後のプレイヤーデータ、見つからない場合はundefined
 */
export function updatePlayerData(
  userId: number,
  updates: Partial<Omit<PlayerData, 'UserId' | 'JoinedAt'>>,
): PlayerData | undefined {
  const existing = playerDataCache.get(userId);
  if (!existing) return undefined;

  const updatedData: PlayerData = {
    ...existing,
    ...updates,
  };
  playerDataCache.set(userId, updatedData);
  return updatedData;
}

/**
 * プレイヤーデータを削除（退出時）
 * @param userId ユーザーID
 * @returns 削除成功した場合true
 */
export function removePlayerData(userId: number): boolean {
  return playerDataCache.delete(userId);
}

/**
 * 全プレイヤーデータを取得
 * @returns 全プレイヤーデータの配列
 */
export function getAllPlayerData(): PlayerData[] {
  const allPlayerData: PlayerData[] = [];
  playerDataCache.forEach((data) => {
    allPlayerData.push(data);
  });

  return allPlayerData;
}

/**
 * プレイヤー数を取得
 * @returns 現在のプレイヤー数
 */
export function getPlayerCount(): number {
  return playerDataCache.size();
}
