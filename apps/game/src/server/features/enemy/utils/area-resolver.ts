/**
 * 敵スポーンエリアの解決ユーティリティ
 * - PlaceKeyからエリアを検索
 * - エリアIDとレベルの解決
 */

import { CollectionService } from '@rbxts/services';
import { ATTRIBUTES, TAGS } from 'shared/constants';
import type { AreaContext, AreaId, AreaLevel } from 'shared/types/enemy';
import { toAreaLevel } from 'shared/utils/type-guards';

/**
 * PlaceKeyに対応する敵エリアを取得
 * @param placeKey プレイスキー
 * @returns 対応するエリアのBasePart、見つからない場合はundefined
 */
export function resolveEnemyAreaByPlaceKey(
  placeKey: string,
): BasePart | undefined {
  for (const inst of CollectionService.GetTagged(TAGS.ENEMY_AREA)) {
    if (!inst.IsA('BasePart')) continue;

    const key = inst.GetAttribute(ATTRIBUTES.PlaceKey);
    if (typeIs(key, 'string') && key === placeKey) {
      return inst;
    }
  }

  return undefined;
}

/**
 * エリアIDを解決（Attributeから取得、なければName）
 */
function resolveAreaId(area: Instance): AreaId {
  const getAttribute = area.GetAttribute(ATTRIBUTES.AreaId);
  if (typeIs(getAttribute, 'string') && getAttribute !== '') {
    return getAttribute;
  }

  return area.Name;
}

/**
 * エリアレベルを解決（Attributeから取得、なければ1）
 */
function resolveAreaLevel(area: Instance): AreaLevel {
  const getAttribute = area.GetAttribute(ATTRIBUTES.AreaLevel);
  if (typeIs(getAttribute, 'number')) {
    const areaLevel = toAreaLevel(getAttribute);
    if (areaLevel !== undefined) {
      return areaLevel;
    }
  }

  return 1;
}

/**
 * 全ての敵エリアを解決してAreaContextの配列で返す
 * @returns エリアコンテキストの配列
 */
export function resolveAreas(): AreaContext[] {
  const areas = CollectionService.GetTagged(TAGS.ENEMY_AREA);
  return areas.map(
    (area): AreaContext => ({
      Area: area,
      AreaId: resolveAreaId(area),
      Level: resolveAreaLevel(area),
    }),
  );
}
