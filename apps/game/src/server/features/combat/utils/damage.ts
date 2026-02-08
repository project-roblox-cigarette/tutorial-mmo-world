/**
 * ダメージ処理ユーティリティ
 * - 敵へのダメージ適用
 * - 死亡処理
 */

import { CollectionService } from '@rbxts/services';
import { ATTRS, TAGS } from 'shared/constants';
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
  if (!enemy || !enemy.Parent) return Result.err('NO_TARGET');

  // Enemyタグがついているか確認。
  if (!CollectionService.HasTag(enemy, TAGS.ENEMY))
    return Result.err('NOT_ENEMY');

  // 二重処理防止
  if (enemy.GetAttribute(ATTRS.DEAD) === true)
    return Result.err('ALREADY_DEAD');

  // Humanoid方式
  const humanoid = enemy.FindFirstChildWhichIsA('Humanoid', true);
  if (humanoid?.IsA('Humanoid')) {
    humanoid.TakeDamage(amount);

    if (humanoid.Health <= 0) {
      enemy.SetAttribute(ATTRS.DEAD, true);
      return Result.ok({ killed: true });
    }
    return Result.ok({ killed: false });
  }

  // Attrubute方式
  const hp = enemy.GetAttribute(ATTRS.HP);
  if (typeIs(hp, 'number')) {
    const newHP = math.max(0, hp - amount);
    enemy.SetAttribute(ATTRS.HP, newHP);

    if (newHP <= 0) {
      enemy.SetAttribute(ATTRS.DEAD, true);
      return Result.ok({ killed: true });
    }
    return Result.ok({ killed: false });
  }

  return Result.err('NO_HEALTH_COMPONENT');
}

/**
 * 死亡確定後の後処理
 * @param enemy 敵のモデル
 */
export function finalizeEnemyDeath(enemy: Model): void {
  if (!enemy || !enemy.Parent) return;

  if (CollectionService.HasTag(enemy, TAGS.ENEMY)) {
    CollectionService.RemoveTag(enemy, TAGS.ENEMY);
  }

  enemy.Destroy();
}
