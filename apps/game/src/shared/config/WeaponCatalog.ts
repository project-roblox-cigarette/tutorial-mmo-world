import type { WeaponId } from '../types/weapon';

/**
 * Tool から WeaponId を取得する。
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
