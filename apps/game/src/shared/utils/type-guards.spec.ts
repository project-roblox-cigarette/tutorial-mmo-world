/**
 * type-guards.tsのテスト
 */

/// <reference types="@rbxts/testez/globals" />

import {
  assertIsPlaceKey,
  getNumberAttribute,
  getStringAttribute,
  isBasePart,
  toAreaLevel,
} from './type-guards';

export = () => {
  describe('toAreaLevel', () => {
    it('有効な数値をAreaLevelに変換できる', () => {
      expect(toAreaLevel(1)).to.equal(1);
      expect(toAreaLevel(2)).to.equal(2);
      expect(toAreaLevel(3)).to.equal(3);
    });

    it('無効な数値はundefinedを返す', () => {
      expect(toAreaLevel(0)).to.equal(undefined);
      expect(toAreaLevel(4)).to.equal(undefined);
      expect(toAreaLevel(-1)).to.equal(undefined);
      expect(toAreaLevel(100)).to.equal(undefined);
    });

    it('小数点数値はundefinedを返す', () => {
      expect(toAreaLevel(1.5)).to.equal(undefined);
      expect(toAreaLevel(2.9)).to.equal(undefined);
    });
  });

  describe('assertIsPlaceKey', () => {
    it('有効なPlaceKeyに対してtrueを返す', () => {
      expect(assertIsPlaceKey('Lobby')).to.equal(true);
      expect(assertIsPlaceKey('EnemyArea_Lv1')).to.equal(true);
      expect(assertIsPlaceKey('EnemyArea_Lv2')).to.equal(true);
      expect(assertIsPlaceKey('EnemyArea_Lv3')).to.equal(true);
    });

    it('無効なPlaceKeyに対してfalseを返す', () => {
      expect(assertIsPlaceKey('InvalidPlace')).to.equal(false);
      expect(assertIsPlaceKey('lobby')).to.equal(false); // 大文字小文字を区別
      expect(assertIsPlaceKey('')).to.equal(false);
    });

    it('文字列以外の値に対してfalseを返す', () => {
      expect(assertIsPlaceKey(123)).to.equal(false);
      expect(assertIsPlaceKey(undefined)).to.equal(false);
      expect(assertIsPlaceKey(true)).to.equal(false);
      expect(assertIsPlaceKey({})).to.equal(false);
    });
  });

  describe('getNumberAttribute', () => {
    it('数値のAttributeを取得できる', () => {
      const part = new Instance('Part');
      part.SetAttribute('TestNumber', 42);

      expect(getNumberAttribute(part, 'TestNumber', 0)).to.equal(42);

      part.Destroy();
    });

    it('存在しないAttributeの場合はデフォルト値を返す', () => {
      const part = new Instance('Part');

      expect(getNumberAttribute(part, 'NonExistent', 100)).to.equal(100);

      part.Destroy();
    });

    it('数値以外のAttributeの場合はデフォルト値を返す', () => {
      const part = new Instance('Part');
      part.SetAttribute('TestString', 'not a number');

      expect(getNumberAttribute(part, 'TestString', 50)).to.equal(50);

      part.Destroy();
    });
  });

  describe('getStringAttribute', () => {
    it('文字列のAttributeを取得できる', () => {
      const part = new Instance('Part');
      part.SetAttribute('TestString', 'hello');

      expect(getStringAttribute(part, 'TestString', '')).to.equal('hello');

      part.Destroy();
    });

    it('存在しないAttributeの場合はデフォルト値を返す', () => {
      const part = new Instance('Part');

      expect(getStringAttribute(part, 'NonExistent', 'default')).to.equal(
        'default',
      );

      part.Destroy();
    });

    it('文字列以外のAttributeの場合はデフォルト値を返す', () => {
      const part = new Instance('Part');
      part.SetAttribute('TestNumber', 123);

      expect(getStringAttribute(part, 'TestNumber', 'default')).to.equal(
        'default',
      );

      part.Destroy();
    });
  });

  describe('isBasePart', () => {
    it('BasePartに対してtrueを返す', () => {
      const part = new Instance('Part');
      expect(isBasePart(part)).to.equal(true);
      part.Destroy();

      const wedge = new Instance('WedgePart');
      expect(isBasePart(wedge)).to.equal(true);
      wedge.Destroy();

      const meshPart = new Instance('MeshPart');
      expect(isBasePart(meshPart)).to.equal(true);
      meshPart.Destroy();
    });

    it('BasePart以外のInstanceに対してfalseを返す', () => {
      const model = new Instance('Model');
      expect(isBasePart(model)).to.equal(false);
      model.Destroy();

      const folder = new Instance('Folder');
      expect(isBasePart(folder)).to.equal(false);
      folder.Destroy();
    });

    it('Instance以外の値に対してfalseを返す', () => {
      expect(isBasePart(123)).to.equal(false);
      expect(isBasePart('string')).to.equal(false);
      expect(isBasePart(undefined)).to.equal(false);
      expect(isBasePart(true)).to.equal(false);
      expect(isBasePart({})).to.equal(false);
    });
  });
};
