/**
 * ダメージ処理ユーティリティ
 * - 敵へのダメージ適用
 * - 死亡処理
 */

import { CollectionService } from '@rbxts/services';
import { ATTRIBUTES, TAGS } from 'shared/constants';
import type { DamageApplyResult } from 'shared/types/combat';
import { Result } from 'shared/types/result';

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

  // 二重処理防止
  if (enemy.GetAttribute(ATTRIBUTES.Dead) === true) {
    return Result.failure('ALREADY_DEAD');
  }

  // Humanoid方式
  const getHumanoid = enemy.FindFirstChildWhichIsA('Humanoid', true);
  if (getHumanoid?.IsA('Humanoid')) {
    getHumanoid.TakeDamage(amount);

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
 * 死亡確定後の後処理
 * @param enemy 敵のモデル
 */
export function finalizeEnemyDeath(enemy: Model): void {
  if (!enemy || !enemy.Parent) {
    return;
  }

  if (CollectionService.HasTag(enemy, TAGS.ENEMY)) {
    CollectionService.RemoveTag(enemy, TAGS.ENEMY);
  }

  enemy.Destroy();
}
