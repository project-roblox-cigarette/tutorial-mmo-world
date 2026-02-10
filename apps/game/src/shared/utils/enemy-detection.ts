/**
 * 敵検索関連のユーティリティ関数
 *
 * プレイヤーの検出や距離計算など、敵AIで使用する共通機能を提供します。
 */

import { Players } from '@rbxts/services';
import { getRootPartFromModel, isAliveCharacter } from './characters';

/**
 * 指定位置から最も近い生存プレイヤーを検索
 *
 * 範囲内の全プレイヤーをチェックし、最も近い生存プレイヤーのCharacterを返します。
 * 距離の計算は二乗距離（squared distance）で行い、平方根計算を回避して最適化しています。
 *
 * @param position 検索の基準位置
 * @param range 検索範囲（スタッド）
 * @returns 最も近いプレイヤーのCharacter、見つからない場合はundefined
 */
export function findNearestPlayer(
  position: Vector3,
  range: number,
): Model | undefined {
  const range2 = range * range;
  let bestChar: Model | undefined;
  let bestDist2 = math.huge;

  for (const player of Players.GetPlayers()) {
    const model = player.Character;
    if (!isAliveCharacter(model)) {
      continue;
    }

    const root = getRootPartFromModel(model);
    if (!root) {
      continue;
    }

    const dVector = root.Position.sub(position);
    const dist2 = dVector.Dot(dVector);
    if (dist2 <= range2 && dist2 < bestDist2) {
      bestDist2 = dist2;
      bestChar = model;
    }
  }

  return bestChar;
}
