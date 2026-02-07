export type AreaLevel = 1 | 2 | 3;
export type AreaId = string;

export type EnemyChaseConfig = {
  speed: number;
  aggroRange: number;
  stopDistance: number;
  chaseTickSec: number;
  followLagSec: number;
  stopDurationSec: number;
};

export type AreaSpawnConfig = {
  spawnIntervalSec: number;
  maxAlivePerPlayer: number;
  templateName: string;
  chase: EnemyChaseConfig;
};

export type AreaContext = {
  area: Instance;
  areaId: AreaId;
  level: AreaLevel;
};

export type SpawnPositionOptions = {
  paddingStuds?: number;
  yOffsetStuds?: number;
};
