/**
 * 敵スポーン位置の計算ユーティリティ
 * EnemyAreaの範囲内からランダムな座標を生成
 */

import type { SpawnPositionOptions } from 'shared/types/enemy';

/**
 * エリア内のランダムなスポーン位置を取得
 * @param areaPart スポーンエリアのBasePart
 * @param range 乱数ジェネレーター
 * @param options パディングやY軸オフセットなどのオプション
 * @returns スポーン位置のCFrame
 */
export function getSpawnCFrameInArea(
  areaPart: BasePart,
  range: Random,
  options: SpawnPositionOptions = {},
): CFrame {
  const PaddingStuds = options.PaddingStuds ?? 0;
  const YOffsetStuds = options.YOffsetStuds ?? 0;

  // サイズから半分を取得し、padding分を引く
  const half = areaPart.Size.mul(0.5);
  const maxXStuds = math.max(0, half.X - PaddingStuds);
  const maxZStuds = math.max(0, half.Z - PaddingStuds);

  const localXStuds = range.NextNumber(-maxXStuds, maxXStuds);
  const localZStuds = range.NextNumber(-maxZStuds, maxZStuds);

  // ワールド座標に変換
  const worldPos = areaPart.CFrame.PointToWorldSpace(
    new Vector3(localXStuds, 0, localZStuds),
  );

  // 方向をareaPartの向きに合わせる
  return new CFrame(worldPos.add(new Vector3(0, YOffsetStuds, 0)));
}
