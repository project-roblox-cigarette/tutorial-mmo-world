/**
 * 武器関連のユーティリティ関数
 */

import type { WeaponId } from '../types/weapon';

/**
 * ToolからWeaponIdを取得
 * @param tool 武器のToolオブジェクト
 * @returns WeaponId、見つからない場合はundefined
 */
export function tryGetWeaponIdFromTool(tool: Tool): WeaponId | undefined {
  const name = tool.Name;
  if (
    name === 'Sword_Lv0' ||
    name === 'Sword_Lv1' ||
    name === 'Sword_Lv2' ||
    name === 'Sword_Lv3'
  ) {
    return name;
  }
  return undefined;
}
