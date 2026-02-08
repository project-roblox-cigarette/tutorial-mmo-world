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
  Speed: number;
  /** 追跡開始範囲 */
  AggroRange: number;
  /** 停止する距離 */
  StopDistance: number;
  /** 追跡更新間隔（秒） */
  ChaseTickSec: number;
  /** 追尾遅延時間（秒） */
  FollowLagSec: number;
  /** 停止継続時間（秒） */
  StopDurationSec: number;
};

/**
 * エリアごとの敵スポーン設定
 */
export type AreaSpawnConfig = {
  /** スポーン間隔（秒） */
  SpawnIntervalSec: number;
  /** プレイヤーごとの最大同時生存数 */
  MaxAlivePerPlayer: number;
  /** 敵テンプレート名 */
  TemplateName: string;
  /** 追跡設定 */
  Chase: EnemyChaseConfig;
};

/**
 * エリアコンテキスト
 * エリアインスタンスと関連情報を保持
 */
export type AreaContext = {
  /** エリアのインスタンス */
  Area: Instance;
  /** エリアID */
  AreaId: AreaId;
  /** エリアレベル */
  Level: AreaLevel;
};

/**
 * スポーン位置生成のオプション
 */
export type SpawnPositionOptions = {
  /** エリア境界からの余白（スタッド） */
  PaddingStuds?: number;
  /** Y軸方向のオフセット（スタッド） */
  YOffsetStuds?: number;
};
