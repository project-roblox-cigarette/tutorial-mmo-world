export type AreaLevel = 1 | 2 | 3;
export type AreaId = string;

export interface EnemyChaseConfig {
  speed: number; // 追尾速度
  aggroRange: number; // 追尾開始距離
  stopDistance: number; // 停止距離
  chaseTickSec: number; // 追尾更新間隔
  followLagSec: number; // 過去位置追尾の遅延時間
  stopDurationSec: number; // 近づいたら一時停止する時間
}

// エリアごとのスポーン設定
export interface AreaSpawnConfig {
  spawnIntervalSec: number; // リスポーンの間隔
  maxAlivePerPlayer: number; // プレイヤー1人当たりの最大敵出現数
  templateName: string; //

  chase: EnemyChaseConfig; // 追尾設定
}

// レベルをAreaLevel型に変換する
export function toAreaLevel(level: number): AreaLevel | undefined {
  return level === 1 || level === 2 || level === 3 ? level : undefined;
}

// エリアごとのスポーン設定
const CONFIG: Record<AreaId, Record<AreaLevel, AreaSpawnConfig>> = {
  TestArea: {
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
