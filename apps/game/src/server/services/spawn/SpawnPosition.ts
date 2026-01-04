// EnemyAreaの範囲内からランダム座標を作る

export interface SpawnPositionOptions {
  // エリアの端から内側に寄せる距離
  paddingStuds?: number;
  // スポーン一の高さ補正
  yOffsetStuds?: number;
}

export function getSpawnCFrameInArea(
  areaPart: BasePart,
  rng: Random,
  options: SpawnPositionOptions = {},
): CFrame {
  const padding = options.paddingStuds ?? 0;
  const yOffset = options.yOffsetStuds ?? 0;

  // サイズから半分を取得し、padding分を引く
  const half = areaPart.Size.mul(0.5);
  const maxX = math.max(0, half.X - padding);
  const maxZ = math.max(0, half.Z - padding);

  const localX = rng.NextNumber(-maxX, maxX);
  const localZ = rng.NextNumber(-maxZ, maxZ);

  // ワールド座標に変換
  const worldPos = areaPart.CFrame.PointToWorldSpace(
    new Vector3(localX, 0, localZ),
  );

  // 方向をareaPartの向きに合わせる
  return new CFrame(worldPos.add(new Vector3(0, yOffset, 0)));
}
