/**
 * 場所（Place）関連のユーティリティ関数
 */

import { PLACES } from '../constants';
import type { PlaceKey } from '../types/teleport';

/**
 * PlaceKeyからPlaceIdを取得
 * @param key PlaceKey
 * @returns PlaceId
 */
export function getPlaceId(key: PlaceKey): number {
  return PLACES[key].placeId;
}
