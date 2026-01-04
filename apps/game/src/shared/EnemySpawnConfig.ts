export type AreaLevel = 1 | 2 | 3;
export type AreaId = string;

export interface AreaSpawnConfig {
  spawnIntervalSec: number; // リスポーンの間隔
  maxAlivePerPlayer: number; // プレイヤー1人当たりの最大敵出現数
  templateName: string; //
}

const CONFIG: Record<AreaId, Record<AreaLevel, AreaSpawnConfig>> = {
  TestArea: {
    1: {
      spawnIntervalSec: 3.0,
      maxAlivePerPlayer: 2,
      templateName: 'EnemyObject',
    },
    2: {
      spawnIntervalSec: 2.0,
      maxAlivePerPlayer: 2,
      templateName: 'EnemyObject',
    },
    3: {
      spawnIntervalSec: 1.0,
      maxAlivePerPlayer: 2,
      templateName: 'EnemyObject',
    },
  },
};

export function getAreaSpawnConfig(
  areaId: AreaId,
  level: number,
): AreaSpawnConfig | undefined {
  if (level !== 1 && level !== 2 && level !== 3) return undefined;
  return CONFIG[areaId]?.[level];
}
