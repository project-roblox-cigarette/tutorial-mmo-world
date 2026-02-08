/**
 * 戦闘システム関連の型定義
 */

import type { Result } from './result';

/**
 * ダメージエラーの種類
 */
export type DamageError =
  | 'NOT_ENEMY'
  | 'NO_TARGET'
  | 'ALREADY_DEAD'
  | 'NO_HEALTH_COMPONENT';

/**
 * ダメージ成功時の結果
 */
export interface DamageSuccess {
  /** 敵を撃破したかどうか */
  killed: boolean;
}

/**
 * ダメージ適用の結果型
 */
export type DamageApplyResult = Result<DamageSuccess, DamageError>;

/**
 * ヒット判定の結果
 */
export type HitDetectionResult = {
  /** ヒットした敵のリスト */
  enemies: Model[];
};

/**
 * 近接攻撃のリクエスト
 * クライアントからサーバーへ送信
 */
export type MeleeAttackRequest = {
  /** デバッグ用の武器名（オプション） */
  debugWeaponName?: string;
};
