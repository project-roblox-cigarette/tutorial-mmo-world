import { CollectionService } from '@rbxts/services';

const ENEMY_AREA_TAG = 'EnemyArea';

export function resolveEnemyAreaByPlaceKey(
  placeKey: string,
): BasePart | undefined {
  for (const inst of CollectionService.GetTagged(ENEMY_AREA_TAG)) {
    if (!inst.IsA('BasePart')) continue;
    const key = inst.GetAttribute('PlaceKey');
    if (typeOf(key) === 'string' && key === placeKey) return inst;
  }
  return undefined;
}
