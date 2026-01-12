export type AreaLevel = 1 | 2 | 3;
export type AreaId = string;

// エリアごとのスポーン設定
export interface AreaSpawnConfig {
  spawnIntervalSec: number; // リスポーンの間隔
  maxAlivePerPlayer: number; // プレイヤー1人当たりの最大敵出現数
  templateName: string; //
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
    },
    2: {
      spawnIntervalSec: 2.0,
      maxAlivePerPlayer: 2,
      templateName: 'EnemyObject_Lv2',
    },
    3: {
      spawnIntervalSec: 1.0,
      maxAlivePerPlayer: 2,
      templateName: 'EnemyObject_Lv3',
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
