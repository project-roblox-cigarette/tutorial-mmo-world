import { CollectionService } from '@rbxts/services';

const ENEMY_AREA_TAG = 'EnemyArea';

function isInsideOBB(part: BasePart, point: Vector3): boolean {
  const localPos = part.CFrame.PointToObjectSpace(point);
  const half = part.Size.mul(0.5);

  return (
    math.abs(localPos.X) <= half.X &&
    math.abs(localPos.Y) <= half.Y &&
    math.abs(localPos.Z) <= half.Z
  );
}

export function resolveEnemyAreaForPlayer(
  player: Player,
): BasePart | undefined {
  const char = player.Character;
  if (!char) return undefined;

  const hrp = char.FindFirstChild('HumanoidRootPart');
  if (!hrp || !hrp.IsA('BasePart')) return undefined;

  const p = hrp.Position;

  for (const inst of CollectionService.GetTagged(ENEMY_AREA_TAG)) {
    if (!inst.IsA('BasePart')) continue;
    if (isInsideOBB(inst, p)) return inst;
  }
  return undefined;
}
