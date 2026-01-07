import { CollectionService } from '@rbxts/services';
import {
  AreaId,
  AreaLevel,
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
  const v = area.GetAttribute(AREA_ID_ATTR); // AttributeValue | undefined
  if (typeIs(v, 'string') && v !== '') return v;
  return area.Name;
}

function resolveAreaLevel(area: Instance): AreaLevel {
  const v = area.GetAttribute(AREA_LEVEL_ATTR); // AttributeValue | undefined
  if (typeIs(v, 'number')) {
    const lv = toAreaLevel(v);
    if (lv !== undefined) return lv;
  }
  return 1;
}

export function resolveAreas(): AreaContext[] {
  const areas = CollectionService.GetTagged('EnemyArea');
  return areas.map((a) => ({
    area: a,
    areaId: resolveAreaId(a),
    level: resolveAreaLevel(a),
  }));
}
