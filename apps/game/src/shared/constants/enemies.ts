import type { AreaId, AreaLevel, AreaSpawnConfig } from '../types/enemy';

/**
 * 敵スポーン設定
 * エリアごとの敵の出現パラメータを定義
 */
export const ENEMY_SPAWN_CONFIG: Record<
  AreaId,
  Record<AreaLevel, AreaSpawnConfig>
> = {
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
        followLagSec: 0,
        stopDurationSec: 3,
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
