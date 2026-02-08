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
    // 敵スポーンエリア
    1: {
      spawnIntervalSec: 3.0, // スポーン間隔
      maxAlivePerPlayer: 2, // プレイヤーごとの最大同時生存数
      templateName: 'EnemyObject_Lv1', // 敵テンプレート名
      chase: {
        speed: 5, // 移動速度
        aggroRange: 60, // 追跡範囲
        stopDistance: 4, // 停止距離
        chaseTickSec: 0.2, // 追跡更新間隔
        followLagSec: 0, // 追尾遅延時間
        stopDurationSec: 3, // 停止継続時間
      },
    },
    2: {
      spawnIntervalSec: 2.0, // スポーン間隔
      maxAlivePerPlayer: 2, // プレイヤーごとの最大同時生存数
      templateName: 'EnemyObject_Lv2', // 敵テンプレート名
      chase: {
        speed: 7, // 移動速度
        aggroRange: 70, // 追跡範囲
        stopDistance: 4, // 停止距離
        chaseTickSec: 0.2, // 追跡更新間隔
        followLagSec: 0, // 追尾遅延時間
        stopDurationSec: 3, // 停止継続時間
      },
    },
    3: {
      spawnIntervalSec: 1.0, // スポーン間隔
      maxAlivePerPlayer: 2, // プレイヤーごとの最大同時生存数
      templateName: 'EnemyObject_Lv3', // 敵テンプレート名
      chase: {
        speed: 9, // 移動速度
        aggroRange: 80, // 追跡範囲
        stopDistance: 4, // 停止距離
        chaseTickSec: 0.15, // 追跡更新間隔
        followLagSec: 0, // 追尾遅延時間
        stopDurationSec: 3, // 停止継続時間
      },
    },
  },
} as const;
