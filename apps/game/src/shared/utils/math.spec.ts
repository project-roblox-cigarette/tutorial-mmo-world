/**
 * math.tsのテスト
 */

/// <reference types="@rbxts/testez/globals" />

import { clamp, lerp, randomInt } from './math';

export = () => {
  describe('clamp', () => {
    it('値を最小値と最大値の間に制限できる', () => {
      expect(clamp(5, 0, 10)).to.equal(5);
      expect(clamp(-5, 0, 10)).to.equal(0);
      expect(clamp(15, 0, 10)).to.equal(10);
    });

    it('最小値と最大値が等しい場合を処理できる', () => {
      expect(clamp(5, 10, 10)).to.equal(10);
      expect(clamp(15, 10, 10)).to.equal(10);
    });

    it('負の数値を処理できる', () => {
      expect(clamp(-5, -10, -1)).to.equal(-5);
      expect(clamp(-15, -10, -1)).to.equal(-10);
      expect(clamp(0, -10, -1)).to.equal(-1);
    });
  });

  describe('lerp', () => {
    it('2つの値の間を線形補間できる', () => {
      expect(lerp(0, 10, 0)).to.equal(0);
      expect(lerp(0, 10, 1)).to.equal(10);
      expect(lerp(0, 10, 0.5)).to.equal(5);
    });

    it('補間係数tを0-1の範囲に制限する', () => {
      expect(lerp(0, 10, -0.5)).to.equal(0);
      expect(lerp(0, 10, 1.5)).to.equal(10);
    });

    it('負の値を処理できる', () => {
      expect(lerp(-10, 10, 0.5)).to.equal(0);
      expect(lerp(-10, -5, 0.5)).to.equal(-7.5);
    });
  });

  describe('randomInt', () => {
    it('指定範囲内の整数を生成する', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(1, 10);
        expect(value >= 1).to.equal(true);
        expect(value <= 10).to.equal(true);
        expect(math.floor(value)).to.equal(value);
      }
    });

    it('最小値と最大値が同じ場合を処理できる', () => {
      const value = randomInt(5, 5);
      expect(value).to.equal(5);
    });

    it('負の範囲を処理できる', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInt(-10, -1);
        expect(value >= -10).to.equal(true);
        expect(value <= -1).to.equal(true);
      }
    });
  });
};
