import { CollectionService } from '@rbxts/services';
import {
  type AreaId,
  type AreaLevel,
  toAreaLevel,
} from '../../../../shared/config/EnemySpawnConfig';

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

export interface AreaContext {
  area: Instance;
  areaId: AreaId;
  level: AreaLevel;
}

const AREA_ID_ATTR = 'AreaId';
const AREA_LEVEL_ATTR = 'Level';

function resolveAreaId(area: Instance): AreaId {
  const attribute = area.GetAttribute(AREA_ID_ATTR); // AttributeValue | undefined
  if (typeIs(attribute, 'string') && attribute !== '') return attribute;
  return area.Name;
}

function resolveAreaLevel(area: Instance): AreaLevel {
  const attribute = area.GetAttribute(AREA_LEVEL_ATTR); // AttributeValue | undefined
  if (typeIs(attribute, 'number')) {
    const lv = toAreaLevel(attribute);
    if (lv !== undefined) return lv;
  }
  return 1;
}

export function resolveAreas(): AreaContext[] {
  const areas = CollectionService.GetTagged('EnemyArea');
  return areas.map((area) => ({
    area: area,
    areaId: resolveAreaId(area),
    level: resolveAreaLevel(area),
  }));
}
