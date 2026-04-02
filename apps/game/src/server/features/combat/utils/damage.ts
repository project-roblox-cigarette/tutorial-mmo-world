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

/**
 * 敵にダメージを適用
 * @param enemy 敵のモデル
 * @param amount ダメージ量
 * @returns ダメージ適用結果（成功/失敗、撃破フラグ）
 */
export function applyDamageToEnemy(
  enemy: Model,
  amount: number,
): DamageApplyResult {
  //
  if (!enemy || !enemy.Parent) {
    return Result.failure('NO_TARGET');
  }

  // Enemyタグがついているか確認。
  if (!CollectionService.HasTag(enemy, TAGS.ENEMY)) {
    return Result.failure('NOT_ENEMY');
  }

  // 既に死亡済みなら追加ダメージは適用しない
  if (enemy.GetAttribute(ATTRIBUTES.Dead) === true) {
    return Result.failure('ALREADY_DEAD');
  }

  // Humanoid方式
  const getHumanoid = enemy.FindFirstChildWhichIsA('Humanoid', true);
  if (getHumanoid?.IsA('Humanoid')) {
    getHumanoid.TakeDamage(amount);
    enemy.SetAttribute(ATTRIBUTES.Hp, getHumanoid.Health);

    if (getHumanoid.Health <= 0) {
      enemy.SetAttribute(ATTRIBUTES.Dead, true);
      return Result.success({ Killed: true });
    }

    return Result.success({ Killed: false });
  }

  // Attrubute方式
  const getHP = enemy.GetAttribute(ATTRIBUTES.Hp);
  if (typeIs(getHP, 'number')) {
    const newHP = math.max(0, getHP - amount);
    enemy.SetAttribute(ATTRIBUTES.Hp, newHP);

    if (newHP <= 0) {
      enemy.SetAttribute(ATTRIBUTES.Dead, true);
      return Result.success({ Killed: true });
    }

    return Result.success({ Killed: false });
  }

  return Result.failure('NO_HEALTH_COMPONENT');
}

/**
 * 敵の死亡処理が既に行われているか確認
 * @param enemyModel 敵のモデル
 * @returns 死亡処理が既に行われている場合は true、それ以外は false
 */
function isDeathAlreadyHandled(enemyModel: Model): boolean {
  return enemyModel.GetAttribute(ATTRIBUTES.DeathHandled) === true;
}

/**
 * 敵の死亡処理をマークする（以降の処理で死亡処理済みかどうかを判定するためのフラグをセット）
 * @param enemyModel 敵のモデル
 */
function markDeathHandled(enemyModel: Model): void {
  enemyModel.SetAttribute(ATTRIBUTES.DeathHandled, true);
  enemyModel.SetAttribute(ATTRIBUTES.Dead, true);
}

/**
 * 敵の報酬対象かどうかを判定
 * @param enemyModel 敵のモデル
 * @param killerPlayer 倒したプレイヤー
 * @returns 報酬対象の場合は true、それ以外は false
 */
function isRewardEligibleKiller(
  enemyModel: Model,
  killerPlayer: Player,
): boolean {
  const ownerUserIdAttribute = enemyModel.GetAttribute(ATTRIBUTES.OwnerUserId);

  // OwnerUserId を持たない敵は「誰が倒しても報酬OK」
  if (!typeIs(ownerUserIdAttribute, 'number')) return true;

  // OwnerUserId を持つ敵は「所有者のみ報酬OK」
  return ownerUserIdAttribute === killerPlayer.UserId;
}

/**
 * 敵のレベルを解決
 * @param enemyModel 敵のモデル
 * @returns 敵のレベル（1〜3）
 */
function resolveEnemyLevel(enemyModel: Model): 1 | 2 | 3 {
  const enemyLevelAttribute = enemyModel.GetAttribute(ATTRIBUTES.EnemyLevel);
  const enemyLevel = typeIs(enemyLevelAttribute, 'number')
    ? toAreaLevel(enemyLevelAttribute)
    : undefined;

  // 不正/欠損時はLv1として扱う（安全側）
  return (enemyLevel ?? 1) as 1 | 2 | 3;
}

/**
 * 敵に経験値報酬を付与
 * @param enemyModel 敵のモデル
 * @param killerPlayer 倒したプレイヤー
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
 * - 経験値の付与
 * - タグの後始末
 * - モデルの破壊
 * など、敵が死亡した際に必要な一連の処理をまとめて行う
 * @param enemyModel 敵のモデル
 * @param killerPlayer 倒したプレイヤー
 */
export function finalizeEnemyDeath(
  enemyModel: Model,
  killerPlayer?: Player,
): void {
  if (!enemyModel || !enemyModel.Parent) return;

  // 二重処理防止（経験値の二重付与も防ぐ）
  if (isDeathAlreadyHandled(enemyModel)) return;

  markDeathHandled(enemyModel);

  if (killerPlayer) {
    grantExpReward(enemyModel, killerPlayer);
  }

  // タグ後始末 → Destroy
  if (CollectionService.HasTag(enemyModel, TAGS.ENEMY)) {
    CollectionService.RemoveTag(enemyModel, TAGS.ENEMY);
  }

  enemyModel.Destroy();
}
