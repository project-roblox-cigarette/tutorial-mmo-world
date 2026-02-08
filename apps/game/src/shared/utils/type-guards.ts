/**
 * 型ガード・型変換関連のユーティリティ関数
 */

import { PLACES } from '../constants';
import type { PlaceKey } from '../types/teleport';

/**
 * 数値をAreaLevel型に変換する
 * @param level 変換する数値
 * @returns AreaLevel型の値、または変換できない場合はundefined
 */
export function toAreaLevel(level: number): 1 | 2 | 3 | undefined {
  return level === 1 || level === 2 || level === 3 ? level : undefined;
}

/**
 * Studioから取得した文字列がPLACESに含まれているキーかを判定する。
 * @param value Studioから取得した文字列
 * @returns trueでPlaceKeyとして使用可能。型安全を担保する。
 */
export function assertIsPlaceKey(value: unknown): value is PlaceKey {
  if (!typeIs(value, 'string')) return false;
  return (PLACES as Record<string, unknown>)[value] !== undefined;
}
