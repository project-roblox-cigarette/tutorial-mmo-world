import { ENEMY_SPAWN_CONFIG } from '../constants';
import type { AreaId, AreaSpawnConfig } from '../types/enemy';
import { toAreaLevel } from '../utils';

export function getAreaSpawnConfig(
  areaId: AreaId,
  level: number,
): AreaSpawnConfig | undefined {
  const lv = toAreaLevel(level);
  if (!lv) return undefined;
  return ENEMY_SPAWN_CONFIG[areaId]?.[lv];
}
