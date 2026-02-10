/**
 * キャラクター関連のユーティリティ関数
 *
 * Model（プレイヤーや敵）からRootPartやHumanoidを取得したり、
 * 生存状態を判定するための共通関数を提供します。
 */

/**
 * ModelからHumanoidRootPartを取得
 * PrimaryPartが設定されている場合はそれを優先し、
 * なければHumanoidRootPartという名前の子を探します。
 *
 * @param model 対象のModel
 * @returns HumanoidRootPart、見つからない場合はundefined
 */
export function getRootPartFromModel(model: Model): BasePart | undefined {
  return (
    model.PrimaryPart ??
    (model.FindFirstChild('HumanoidRootPart') as BasePart | undefined)
  );
}

/**
 * ModelからHumanoidを取得
 *
 * @param model 対象のModel
 * @returns Humanoid、見つからない場合はundefined
 */
export function getHumanoidFromModel(model: Model): Humanoid | undefined {
  return model.FindFirstChildOfClass('Humanoid');
}

/**
 * キャラクターが生存しているか判定（Type Guard）
 * Modelが存在し、HumanoidがありHealth > 0の場合にtrueを返します。
 *
 * @param model 判定対象のModel（undefinedも受け付ける）
 * @returns 生存している場合true（型ガード付き）
 */
export function isAliveCharacter(model?: Model): model is Model {
  if (!model) {
    return false;
  }

  const humanoid = getHumanoidFromModel(model);
  return humanoid !== undefined && humanoid.Health > 0;
}
