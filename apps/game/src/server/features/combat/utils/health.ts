import { ATTRIBUTES } from 'shared/constants';
import type { DamageApplyResult } from 'shared/types/combat';
import { Result } from 'shared/types/result';
import { logger } from '../../../../shared/utils';

/**
 * モデル内のHumanoidを検索する
 * @param model 検索対象のモデル
 * @returns Humanoidが見つかった場合はHumanoid、見つからなかった場合はundefined
 */
function findHumanoid(model: Model): Humanoid | undefined {
  const humanoid = model.FindFirstChildWhichIsA('Humanoid', true);
  return humanoid?.IsA('Humanoid') ? humanoid : undefined;
}

/**
 * モデルの体力を初期化する
 * @param model 初期化対象のモデル
 * @param maxHp 最大体力
 */
export function initializeHealth(model: Model, maxHp: number): void {
  // 最大体力を1以上の整数に正規化
  const normalizedMaxHp = math.max(1, math.floor(maxHp));

  // モデルの属性に体力情報を設定
  model.SetAttribute(ATTRIBUTES.MaxHp, normalizedMaxHp);
  model.SetAttribute(ATTRIBUTES.Hp, normalizedMaxHp);
  model.SetAttribute(ATTRIBUTES.Dead, false);

  // Humanoidが存在する場合はHumanoidの体力も設定
  const humanoid = findHumanoid(model);
  if (humanoid) {
    humanoid.MaxHealth = normalizedMaxHp;
    humanoid.Health = normalizedMaxHp;
  }
}

/**
 * モデルの現在の体力を取得する
 * @param model 体力を取得する対象のモデル
 * @returns 現在の体力、または取得できない場合はundefined
 */
export function getCurrentHp(model: Model): number | undefined {
  const hpAttribute = model.GetAttribute(ATTRIBUTES.Hp);
  if (typeIs(hpAttribute, 'number')) {
    return hpAttribute;
  }

  const humanoid = findHumanoid(model);
  if (humanoid) {
    return humanoid.Health;
  }

  return undefined;
}

/**
 * モデルの最大体力を取得する
 * @param model 最大体力を取得する対象のモデル
 * @returns 最大体力、または取得できない場合はundefined
 */
export function getMaxHp(model: Model): number | undefined {
  const maxHpAttribute = model.GetAttribute(ATTRIBUTES.MaxHp);
  if (typeIs(maxHpAttribute, 'number')) {
    return maxHpAttribute;
  }

  const humanoid = findHumanoid(model);
  if (humanoid) {
    return humanoid.MaxHealth;
  }

  return undefined;
}

/**
 * モデルが死亡しているかどうかを判定する
 * @param model 判定対象のモデル
 * @returns 死亡している場合はtrue、そうでない場合はfalse
 */
export function isDead(model: Model): boolean {
  return model.GetAttribute(ATTRIBUTES.Dead) === true;
}

/**
 * モデルにダメージを適用する
 * @param model ダメージを適用する対象のモデル
 * @param amount 適用するダメージ量
 * @returns ダメージ適用結果
 */
export function applyDamageToModel(
  model: Model,
  amount: number,
): DamageApplyResult {
  // ターゲットが存在しない場合はエラー
  if (!model || !model.Parent) {
    return Result.failure('NO_TARGET');
  }

  // ターゲットが敵でない場合はエラー
  if (isDead(model)) {
    return Result.failure('ALREADY_DEAD');
  }

  // ダメージ量が0以下の場合は何もせず成功を返す
  if (amount <= 0) {
    return Result.success({ Killed: false });
  }

  // 現在の体力と最大体力を取得
  const currentHp = getCurrentHp(model);
  const maxHp = getMaxHp(model);

  // 体力コンポーネントが存在しない場合はエラー
  if (currentHp === undefined || maxHp === undefined) {
    return Result.failure('NO_HEALTH_COMPONENT');
  }

  // ダメージを適用して次の体力を計算
  const nextHp = math.max(0, currentHp - amount);

  // モデルの属性に次の体力を設定
  model.SetAttribute(ATTRIBUTES.Hp, nextHp);
  model.SetAttribute(ATTRIBUTES.MaxHp, maxHp);

  // Humanoidが存在する場合はHumanoidの体力も設定
  const humanoid = findHumanoid(model);
  if (humanoid) {
    if (humanoid.MaxHealth !== maxHp) {
      humanoid.MaxHealth = maxHp;
    }
    humanoid.Health = nextHp;
  }

  // ログ出力
  logger.debug(
    'Health',
    `ダメージ適用: Model=${model.Name} Damage=${amount} CurrentHp=${currentHp} NextHp=${nextHp}`,
  );

  // 体力が0以下になった場合は死亡とみなす
  if (nextHp <= 0) {
    model.SetAttribute(ATTRIBUTES.Dead, true);
    return Result.success({ Killed: true });
  }

  // まだ生きている場合は成功を返す
  return Result.success({ Killed: false });
}
