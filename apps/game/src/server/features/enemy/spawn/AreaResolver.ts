import { CollectionService } from '@rbxts/services';
import { ATTRS, TAGS } from 'shared/constants';
import type { AreaContext, AreaId, AreaLevel } from 'shared/types/enemy';
import { toAreaLevel } from 'shared/utils';

export function resolveEnemyAreaByPlaceKey(
  placeKey: string,
): BasePart | undefined {
  for (const inst of CollectionService.GetTagged(TAGS.ENEMY_AREA)) {
    if (!inst.IsA('BasePart')) continue;
    const key = inst.GetAttribute(ATTRS.PLACE_KEY);
    if (typeOf(key) === 'string' && key === placeKey) return inst;
  }
  return undefined;
}

function resolveAreaId(area: Instance): AreaId {
  const attribute = area.GetAttribute(ATTRS.AREA_ID); // AttributeValue | undefined
  if (typeIs(attribute, 'string') && attribute !== '') return attribute;
  return area.Name;
}

function resolveAreaLevel(area: Instance): AreaLevel {
  const attribute = area.GetAttribute(ATTRS.AREA_LEVEL); // AttributeValue | undefined
  if (typeIs(attribute, 'number')) {
    const lv = toAreaLevel(attribute);
    if (lv !== undefined) return lv;
  }
  return 1;
}

export function resolveAreas(): AreaContext[] {
  const areas = CollectionService.GetTagged(TAGS.ENEMY_AREA);
  return areas.map((area) => ({
    area: area,
    areaId: resolveAreaId(area),
    level: resolveAreaLevel(area),
  }));
}
