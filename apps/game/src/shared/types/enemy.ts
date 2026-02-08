/**
 * 敵システム関連の型定義
 */

/** エリアのレベル（1〜3） */
export type AreaLevel = 1 | 2 | 3;

/** エリアの識別子 */
export type AreaId = string;

/**
 * 敵の追跡（Chase）設定
 */
export type EnemyChaseConfig = {
  /** 移動速度 */
  speed: number;
  /** 追跡開始範囲 */
  aggroRange: number;
  /** 停止する距離 */
  stopDistance: number;
  /** 追跡更新間隔（秒） */
  chaseTickSec: number;
  /** 追尾遅延時間（秒） */
  followLagSec: number;
  /** 停止継続時間（秒） */
  stopDurationSec: number;
};

/**
 * エリアごとの敵スポーン設定
 */
export type AreaSpawnConfig = {
  /** スポーン間隔（秒） */
  spawnIntervalSec: number;
  /** プレイヤーごとの最大同時生存数 */
  maxAlivePerPlayer: number;
  /** 敵テンプレート名 */
  templateName: string;
  /** 追跡設定 */
  chase: EnemyChaseConfig;
};

/**
 * エリアコンテキスト
 * エリアインスタンスと関連情報を保持
 */
export type AreaContext = {
  /** エリアのインスタンス */
  area: Instance;
  /** エリアID */
  areaId: AreaId;
  /** エリアレベル */
  level: AreaLevel;
};

/**
 * スポーン位置生成のオプション
 */
export type SpawnPositionOptions = {
  /** エリア境界からの余白（スタッド） */
  paddingStuds?: number;
  /** Y軸方向のオフセット（スタッド） */
  yOffsetStuds?: number;
};
