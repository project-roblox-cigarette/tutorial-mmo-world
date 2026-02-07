import { CollectionService } from '@rbxts/services';
import { TAG_ENEMY } from 'shared/constants';
import type { DamageApplyResult } from 'shared/types/combat';

export function applyDamageToEnemy(
  enemy: Model,
  amount: number,
): DamageApplyResult {
  //
  if (!enemy || !enemy.Parent) return { ok: false, reason: 'NO_TARGET' };

  // Enemyタグがついているか確認。
  if (!CollectionService.HasTag(enemy, TAG_ENEMY))
    return { ok: false, reason: 'NOT_ENEMY' };

  // 二重処理防止
  if (enemy.GetAttribute('Dead') === true)
    return { ok: false, reason: 'ALREADY_DEAD' };

  // Humanoid方式
  const humanoid = enemy.FindFirstChildWhichIsA('Humanoid', true);
  if (humanoid?.IsA('Humanoid')) {
    humanoid.TakeDamage(amount);

    if (humanoid.Health <= 0) {
      enemy.SetAttribute('Dead', true);
      return { ok: true, killed: true };
    }
    return { ok: true, killed: false };
  }

  // Attrubute方式
  const hp = enemy.GetAttribute('HP');
  if (typeIs(hp, 'number')) {
    const newHP = math.max(0, hp - amount);
    enemy.SetAttribute('HP', newHP);

    if (newHP <= 0) {
      enemy.SetAttribute('Dead', true);
      return { ok: true, killed: true };
    }
    return { ok: true, killed: false };
  }

  return { ok: false, reason: 'NO_HEALTH_COMPONENT' };
}

/**
 * 死亡確定後の後処理
 */
export function finalizeEnemyDeath(enemy: Model): void {
  if (!enemy || !enemy.Parent) return;

  if (CollectionService.HasTag(enemy, TAG_ENEMY)) {
    CollectionService.RemoveTag(enemy, TAG_ENEMY);
  }

  enemy.Destroy();
}
