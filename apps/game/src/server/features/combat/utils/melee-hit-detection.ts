/**
 * 近接攻撃のヒット判定ユーティリティ
 * - ボックスベースの空間クエリ
 * - 剣の刃に沿った判定範囲の生成
 */

import { CollectionService, Workspace } from '@rbxts/services';
import { TAGS } from 'shared/constants';
import type { HitDetectionResult } from 'shared/types/combat';
import { logger } from 'shared/utils/logger';

/**
 * 判定ボックスのデバッグ表示
 * @param boxCFrame ボックスの位置と向き
 * @param boxSize ボックスのサイズ
 */
function debugDrawBox(boxCFrame: CFrame, boxSize: Vector3) {
  const newPart = new Instance('Part');
  newPart.Name = '__HitDebugBox';
  newPart.Anchored = true;
  newPart.CanCollide = false;
  newPart.CanTouch = false;
  newPart.CanQuery = false;
  newPart.Transparency = 0.8;
  newPart.Size = boxSize;
  newPart.CFrame = boxCFrame;
  newPart.Parent = Workspace;

  task.delay(0.15, () => newPart.Destroy());
}

/**
 * 剣の範囲内の敵をボックス判定で検出
 * @param attackerChar 攻撃者のキャラクター
 * @param swordTool 剣のToolオブジェクト
 * @param thickness 判定ボックスの厚み
 * @param maxHits 最大ヒット数
 * @returns ヒットした敵のリスト
 */
export function detectSwordEnemiesByBox(
  attackerChar: Model,
  swordTool: Tool,
  thickness: number,
  maxHits: number,
): HitDetectionResult {
  const handle = swordTool.FindFirstChild('Handle');
  if (!handle || !handle.IsA('BasePart')) {
    return {
      Enemies: [],
    };
  }

  const getRootAtt = handle.FindFirstChild('BladeRoot');
  const getTipAtt = handle.FindFirstChild('BladeTip');

  let vectorA: Vector3;
  let vectorB: Vector3;

  if (getRootAtt?.IsA('Attachment') && getTipAtt?.IsA('Attachment')) {
    vectorA = getRootAtt.WorldPosition;
    vectorB = getTipAtt.WorldPosition;
  } else {
    // Handleの前方を刃方向と仮定して長さを作る
    const cf = handle.CFrame;
    const len = math.max(0.5, handle.Size.Z);
    const half = len / 2;

    vectorA = cf.Position.add(cf.LookVector.mul(-half));
    vectorB = cf.Position.add(cf.LookVector.mul(half));
  }

  const dirVector = vectorB.sub(vectorA);
  const dirMagnitude = dirVector.Magnitude;
  if (dirMagnitude <= 0.05) {
    return {
      Enemies: [],
    };
  }

  const midVector = vectorA.add(vectorB).div(2); // 刃の中点をボックスの中心にする
  const boxCFrame = CFrame.lookAt(midVector, vectorB); // ボックス向き：刃先方向へ向ける
  const boxSize = new Vector3(thickness, thickness, dirMagnitude); // X,Y = 厚み, Z = 刃の長さ

  // 空間クエリのフィルタ設定
  const params = new OverlapParams();
  params.FilterType = Enum.RaycastFilterType.Exclude;
  params.FilterDescendantsInstances = [attackerChar]; // 自分には当たらないように
  params.RespectCanCollide = false; // CanCollide = falseにもあたるように

  debugDrawBox(boxCFrame, boxSize);
  const getParts = Workspace.GetPartBoundsInBox(boxCFrame, boxSize, params); // ボックス内パーツを取得
  const enemyModels = new Set<Model>();

  for (const part of getParts) {
    const getModel = part.FindFirstAncestorOfClass('Model');
    if (!getModel) continue;
    if (!CollectionService.HasTag(getModel, TAGS.ENEMY)) continue; //Enemyタグのモデルのみ対象
    if (!getModel.Parent) continue;

    enemyModels.add(getModel);

    if (enemyModels.size() >= maxHits) break;
  }

  logger.debug(
    'HitDetect',
    `判定結果: parts=${getParts.size()} enemies=${enemyModels.size()}`,
  );
  return {
    Enemies: [...enemyModels],
  };
}
