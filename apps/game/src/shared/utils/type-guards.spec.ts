/**
 * type-guards.tsのテスト
 */

/// <reference types="@rbxts/testez/globals" />

import { assertIsPlaceKey, toAreaLevel } from './type-guards';

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
};
