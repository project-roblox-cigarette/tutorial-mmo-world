/**
 * 型ガード・型変換関連のユーティリティ関数
 */

import { PLACES } from '../constants';
import type { PlaceKey } from '../types/teleport';

/**
 * 数値をAreaLevel型に変換
 * @param level 変換する数値
 * @returns AreaLevel型の値（1,2,3）、変換できない場合はundefined
 */
export function toAreaLevel(level: number): 1 | 2 | 3 | undefined {
  return level === 1 || level === 2 || level === 3 ? level : undefined;
}

/**
 * Studioから取得した文字列がPLACESに含まれているキーかを判定
 * @param value Studioから取得した文字列
 * @returns trueの場合、PlaceKeyとして使用可能（型安全を担保）
 */
export function assertIsPlaceKey(value: unknown): value is PlaceKey {
  if (!typeIs(value, 'string')) return false;
  return (PLACES as Record<string, unknown>)[value] !== undefined;
}

/**
 * Attributeから数値を安全に取得
 * @param instance 対象のInstance
 * @param attributeName Attribute名
 * @param defaultValue 取得できない場合のデフォルト値
 * @returns 数値、取得できない場合はdefaultValue
 */
export function getNumberAttribute(
  instance: Instance,
  attributeName: string,
  defaultValue: number,
): number {
  const value = instance.GetAttribute(attributeName);
  return typeIs(value, 'number') ? value : defaultValue;
}

/**
 * Attributeから文字列を安全に取得
 * @param instance 対象のInstance
 * @param attributeName Attribute名
 * @param defaultValue 取得できない場合のデフォルト値
 * @returns 文字列、取得できない場合はdefaultValue
 */
export function getStringAttribute(
  instance: Instance,
  attributeName: string,
  defaultValue: string,
): string {
  const value = instance.GetAttribute(attributeName);
  return typeIs(value, 'string') ? value : defaultValue;
}

/**
 * 値がBasePart型であるかを判定（Type Guard）
 * @param value 判定する値
 * @returns BasePart型の場合true
 */
export function isBasePart(value: unknown): value is BasePart {
  return typeIs(value, 'Instance') && value.IsA('BasePart');
}
