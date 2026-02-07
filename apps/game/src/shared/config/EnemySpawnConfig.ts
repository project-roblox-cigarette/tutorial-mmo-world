import type { AreaId, AreaLevel, AreaSpawnConfig } from '../types/enemy';
import { toAreaLevel } from '../utils';

// エリアごとのスポーン設定
const CONFIG: Record<AreaId, Record<AreaLevel, AreaSpawnConfig>> = {
  EnemySpawnArea: {
    1: {
      spawnIntervalSec: 3.0,
      maxAlivePerPlayer: 2,
      templateName: 'EnemyObject_Lv1',
      chase: {
        speed: 5,
        aggroRange: 60,
        stopDistance: 4,
        chaseTickSec: 0.2,
        followLagSec: 0, // 後で使う
        stopDurationSec: 3, // 後で使う
      },
    },
    2: {
      spawnIntervalSec: 2.0,
      maxAlivePerPlayer: 2,
      templateName: 'EnemyObject_Lv2',
      chase: {
        speed: 7,
        aggroRange: 70,
        stopDistance: 4,
        chaseTickSec: 0.2,
        followLagSec: 0,
        stopDurationSec: 3,
      },
    },
    3: {
      spawnIntervalSec: 1.0,
      maxAlivePerPlayer: 2,
      templateName: 'EnemyObject_Lv3',
      chase: {
        speed: 9,
        aggroRange: 80,
        stopDistance: 4,
        chaseTickSec: 0.15,
        followLagSec: 0,
        stopDurationSec: 3,
      },
    },
  },
};

export function getAreaSpawnConfig(
  areaId: AreaId,
  level: number,
): AreaSpawnConfig | undefined {
  const lv = toAreaLevel(level);
  if (!lv) return undefined;
  return CONFIG[areaId]?.[lv];
}
