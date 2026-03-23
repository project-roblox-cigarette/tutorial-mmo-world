/**
 * ダメージ処理ユーティリティ
 * - 敵へのダメージ適用
 * - 死亡処理
 */

import { CollectionService } from '@rbxts/services';
import { ATTRIBUTES, ENEMY_BALANCE_BY_LEVEL, TAGS } from 'shared/constants';
import type { DamageApplyResult } from 'shared/types/combat';
import { Result } from 'shared/types/result';
import { randomInt } from 'shared/utils/math';
import { toAreaLevel } from 'shared/utils/type-guards';
import { addExp } from '../../../services/ExpService';
import { applyDamageToModel } from './health';

/**
 * 敵にダメージを適用する
 * - 敵モデルの属性やタグを検査して、ダメージを適用できるかどうかを判断する
 * - ダメージ適用後の体力が0以下になった場合は死亡とみなし、死亡処理を行う
 * @param enemy 敵のモデル
 * @param amount ダメージ量
 * @returns ダメージ適用結果（成功/失敗、撃破フラグ）
 */
export function applyDamageToEnemy(
  enemy: Model,
  amount: number,
): DamageApplyResult {
  if (!enemy || !enemy.Parent) {
    return Result.failure('NO_TARGET');
  }

  if (!CollectionService.HasTag(enemy, TAGS.ENEMY)) {
    return Result.failure('NOT_ENEMY');
  }

  if (enemy.GetAttribute(ATTRIBUTES.Dead) === true) {
    return Result.failure('ALREADY_DEAD');
  }

  return applyDamageToModel(enemy, amount);
}

/**
 * 敵の死亡処理が既に行われているか確認
 * - 敵モデルの属性から死亡処理が行われたかどうかを示すフラグを確認する
 * - これにより、同じ敵に対して複数回死亡処理が行われるのを防止する
 * @param enemyModel 確認対象の敵モデル
 * @returns 死亡処理が既に行われている場合はtrue、そうでない場合はfalse
 */
function isDeathAlreadyHandled(enemyModel: Model): boolean {
  return enemyModel.GetAttribute(ATTRIBUTES.DeathHandled) === true;
}

/**
 * 敵の死亡処理をマークする
 * - 敵モデルの属性に死亡処理が行われたことを示すフラグを設定する
 * - これにより、同じ敵に対して複数回死亡処理が行われるのを防止する
 * @param enemyModel 死亡処理をマークする対象の敵モデル
 */
function markDeathHandled(enemyModel: Model): void {
  enemyModel.SetAttribute(ATTRIBUTES.DeathHandled, true);
  enemyModel.SetAttribute(ATTRIBUTES.Dead, true);
}

/**
 * 敵の報酬対象かどうかを判定
 * - 敵モデルの属性から所有者のUserIdを取得し、キラーのUserIdと比較する
 * - 所有者がいない場合は誰でも報酬対象とする
 * @param enemyModel 判定対象の敵モデル
 * @param killerPlayer キラーのプレイヤーオブジェクト
 * @returns 報酬対象であればtrue、そうでなければfalse
 */
function isRewardEligibleKiller(
  enemyModel: Model,
  killerPlayer: Player,
): boolean {
  const ownerUserIdAttribute = enemyModel.GetAttribute(ATTRIBUTES.OwnerUserId);

  if (!typeIs(ownerUserIdAttribute, 'number')) return true;

  return ownerUserIdAttribute === killerPlayer.UserId;
}

/**
 * 敵のレベルを解決
 * - 敵モデルの属性からレベルを取得し、適切な型に変換する
 * - レベル属性が存在しない場合はデフォルトで1を返す
 * @param enemyModel レベルを解決する対象の敵モデル
 * @returns 敵のレベル（1, 2, 3のいずれか）
 */
function resolveEnemyLevel(enemyModel: Model): 1 | 2 | 3 {
  const enemyLevelAttribute = enemyModel.GetAttribute(ATTRIBUTES.EnemyLevel);
  const enemyLevel = typeIs(enemyLevelAttribute, 'number')
    ? toAreaLevel(enemyLevelAttribute)
    : undefined;

  return (enemyLevel ?? 1) as 1 | 2 | 3;
}

/**
 * 敵に経験値報酬を付与
 * - 敵のレベルに応じた経験値をランダムにドロップ
 * - プレイヤーが報酬対象でない場合は何もしない
 * @param enemyModel 経験値を付与する対象の敵モデル
 * @param killerPlayer 経験値を受け取るプレイヤー
 */
function grantExpReward(enemyModel: Model, killerPlayer: Player): void {
  if (!isRewardEligibleKiller(enemyModel, killerPlayer)) return;

  const enemyLevel = resolveEnemyLevel(enemyModel);
  const enemyBalance = ENEMY_BALANCE_BY_LEVEL[enemyLevel];
  const expDropRange = enemyBalance.ExpDrop;
  const droppedExp = randomInt(expDropRange.Min, expDropRange.Max);

  addExp(killerPlayer.UserId, droppedExp);
}

/**
 * 敵の死亡処理を最終化する
 * - 敵のモデルを破壊する前に、経験値報酬の付与やタグの削除などの処理を行う
 * - @param enemyModel 死亡した敵のモデル
 * - @param killerPlayer 敵を倒したプレイヤー（存在する場合）
 */
export function finalizeEnemyDeath(
  enemyModel: Model,
  killerPlayer?: Player,
): void {
  if (!enemyModel || !enemyModel.Parent) return;

  if (isDeathAlreadyHandled(enemyModel)) return;

  markDeathHandled(enemyModel);

  if (killerPlayer) {
    grantExpReward(enemyModel, killerPlayer);
  }

  if (CollectionService.HasTag(enemyModel, TAGS.ENEMY)) {
    CollectionService.RemoveTag(enemyModel, TAGS.ENEMY);
  }

  enemyModel.Destroy();
}
