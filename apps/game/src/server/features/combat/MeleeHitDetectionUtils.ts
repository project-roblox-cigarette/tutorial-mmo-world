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
 * @param cf ボックスの位置と向き
 * @param size ボックスのサイズ
 */
function debugDrawBox(cf: CFrame, size: Vector3) {
  const p = new Instance('Part');
  p.Name = '__HitDebugBox';
  p.Anchored = true;
  p.CanCollide = false;
  p.CanTouch = false;
  p.CanQuery = false;
  p.Transparency = 0.8;
  p.Size = size;
  p.CFrame = cf;
  p.Parent = Workspace;

  task.delay(0.15, () => p.Destroy());
}

/**
 * 剣の範囲内の敵をボックス判定で検出
 * @param attackkerChar 攻撃者のキャラクター
 * @param swordTool 剣のToolオブジェクト
 * @param thickness 判定ボックスの厚み
 * @param maxHits 最大ヒット数
 * @returns ヒットした敵のリスト
 */
export function detectSwordEnemiesByBox(
  attackkerChar: Model,
  swordTool: Tool,
  thickness: number,
  maxHits: number,
): HitDetectionResult {
  const handle = swordTool.FindFirstChild('Handle');
  if (!handle || !handle.IsA('BasePart')) return { enemies: [] };

  const rootAtt = handle.FindFirstChild('BladeRoot');
  const tipAtt = handle.FindFirstChild('BladeTip');

  let a: Vector3;
  let b: Vector3;

  if (rootAtt?.IsA('Attachment') && tipAtt?.IsA('Attachment')) {
    a = rootAtt.WorldPosition;
    b = tipAtt.WorldPosition;
  } else {
    // Handleの前方を刃方向と仮定して長さを作る
    const cf = handle.CFrame;
    const len = math.max(0.5, handle.Size.Z);
    const half = len / 2;

    a = cf.Position.add(cf.LookVector.mul(-half));
    b = cf.Position.add(cf.LookVector.mul(half));
  }

  const dir = b.sub(a);
  const len = dir.Magnitude;
  if (len <= 0.05) return { enemies: [] };

  const mid = a.add(b).div(2); // 刃の中点をボックスの中心にする
  const cf = CFrame.lookAt(mid, b); // ボックス向き：刃先方向へ向ける
  const size = new Vector3(thickness, thickness, len); // X,Y = 厚み, Z = 刃の長さ

  // 空間クエリのフィルタ設定
  const params = new OverlapParams();
  params.FilterType = Enum.RaycastFilterType.Exclude;
  params.FilterDescendantsInstances = [attackkerChar]; // 自分には当たらないように
  params.RespectCanCollide = false; // CanCollide = falseにもあたるように

  debugDrawBox(cf, size);
  const parts = Workspace.GetPartBoundsInBox(cf, size, params); // ボックス内パーツを取得
  const enemySet = new Set<Model>();

  for (const part of parts) {
    const model = part.FindFirstAncestorOfClass('Model');
    if (!model) continue;

    if (!CollectionService.HasTag(model, TAGS.ENEMY)) continue; //Enemyタグのモデルのみ対象

    if (!model.Parent) continue;

    enemySet.add(model);

    if (enemySet.size() >= maxHits) break;
  }

  logger.debug(
    'HitDetect',
    `判定結果: parts=${parts.size()} enemies=${enemySet.size()}`,
  );
  return { enemies: [...enemySet] };
}
