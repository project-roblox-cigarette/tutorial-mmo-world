import { PLACES } from './constants';
import type { PlaceKey } from './types/teleport';

/**
 * Studioから取得した文字列がPLACESに含まれているキーかを判定する。
 * @param value Studioから取得した文字列
 * @returns trueでPlaceKeyとして使用可能。型安全を担保する。
 */
export function assertIsPlaceKey(value: unknown): value is PlaceKey {
  if (!typeIs(value, 'string')) return false;
  return (PLACES as Record<string, unknown>)[value] !== undefined;
}

/**
 * PlaceKeyからPlaceIdを取得。
 * @param key PlaceKey
 * @returns PlaceId
 */
export function getPlaceId(key: PlaceKey): number {
  return PLACES[key].placeId;
}
