import type { AreaId, AreaLevel, AreaSpawnConfig } from '../types/enemy';

/**
 * 敵スポーン設定
 * エリアごとの敵の出現パラメータを定義
 */
export const ENEMY_SPAWN_CONFIGS: Record<
  AreaId,
  Record<AreaLevel, AreaSpawnConfig>
> = {
  EnemySpawnArea: {
    // 敵スポーンエリア
    1: {
      SpawnIntervalSec: 3.0, // スポーン間隔
      MaxAlivePerPlayer: 2, // プレイヤーごとの最大同時生存数
      TemplateName: 'EnemyObject_Lv1', // 敵テンプレート名
      Chase: {
        Speed: 5, // 移動速度
        AggroRange: 60, // 追跡範囲
        StopDistance: 4, // 停止距離
        ChaseTickSec: 0.2, // 追跡更新間隔
        FollowLagSec: 0, // 追尾遅延時間
        StopDurationSec: 3, // 停止継続時間
      },
    },
    2: {
      SpawnIntervalSec: 2.0, // スポーン間隔
      MaxAlivePerPlayer: 2, // プレイヤーごとの最大同時生存数
      TemplateName: 'EnemyObject_Lv2', // 敵テンプレート名
      Chase: {
        Speed: 7, // 移動速度
        AggroRange: 70, // 追跡範囲
        StopDistance: 4, // 停止距離
        ChaseTickSec: 0.2, // 追跡更新間隔
        FollowLagSec: 0, // 追尾遅延時間
        StopDurationSec: 3, // 停止継続時間
      },
    },
    3: {
      SpawnIntervalSec: 1.0, // スポーン間隔
      MaxAlivePerPlayer: 2, // プレイヤーごとの最大同時生存数
      TemplateName: 'EnemyObject_Lv3', // 敵テンプレート名
      Chase: {
        Speed: 9, // 移動速度
        AggroRange: 80, // 追跡範囲
        StopDistance: 4, // 停止距離
        ChaseTickSec: 0.15, // 追跡更新間隔
        FollowLagSec: 0, // 追尾遅延時間
        StopDurationSec: 3, // 停止継続時間
      },
    },
  },
} as const;
