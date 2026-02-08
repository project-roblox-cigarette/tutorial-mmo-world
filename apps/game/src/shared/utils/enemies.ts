/**
 * 敵関連のユーティリティ関数
 */

import { ENEMY_SPAWN_CONFIG } from '../constants';
import type { AreaId, AreaSpawnConfig } from '../types/enemy';
import { toAreaLevel } from './type-guards';

/**
 * エリアとレベルから敵スポーン設定を取得
 * @param areaId エリアID
 * @param level レベル
 * @returns スポーン設定、見つからない場合はundefined
 */
export function getAreaSpawnConfig(
  areaId: AreaId,
  level: number,
): AreaSpawnConfig | undefined {
  const lv = toAreaLevel(level);
  if (!lv) return undefined;
  return ENEMY_SPAWN_CONFIG[areaId]?.[lv];
}
