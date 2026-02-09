/**
 * weapons.tsのテスト
 */

/// <reference types="@rbxts/testez/globals" />

import { tryGetWeaponIdFromTool } from './weapons';

export = () => {
  describe('tryGetWeaponIdFromTool', () => {
    it('有効な武器ToolからWeaponIdを返す', () => {
      const mockTools = [
        { Name: 'Sword_Lv0' } as Tool,
        { Name: 'Sword_Lv1' } as Tool,
        { Name: 'Sword_Lv2' } as Tool,
        { Name: 'Sword_Lv3' } as Tool,
      ];

      for (const tool of mockTools) {
        const result = tryGetWeaponIdFromTool(tool);
        expect(result).to.equal(tool.Name);
      }
    });

    it('無効な武器名に対してundefinedを返す', () => {
      const invalidTools = [
        { Name: 'Sword_Lv4' } as Tool,
        { Name: 'Sword' } as Tool,
        { Name: 'InvalidWeapon' } as Tool,
        { Name: '' } as Tool,
      ];

      for (const tool of invalidTools) {
        const result = tryGetWeaponIdFromTool(tool);
        expect(result).to.equal(undefined);
      }
    });

    it('大文字小文字を区別する', () => {
      const caseVariations = [
        { Name: 'sword_lv0' } as Tool,
        { Name: 'SWORD_LV0' } as Tool,
        { Name: 'Sword_lv0' } as Tool,
      ];

      for (const tool of caseVariations) {
        const result = tryGetWeaponIdFromTool(tool);
        expect(result).to.equal(undefined);
      }
    });
  });
};
