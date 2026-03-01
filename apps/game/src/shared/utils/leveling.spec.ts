/**
 * leveling.tsのテスト
 */

/// <reference types="@rbxts/testez/globals" />

import {
  applyExpGain,
  expRequiredForNextLevel,
  remainingExpToNextLevel,
} from './leveling';

export = () => {
  describe('expRequiredForNextLevel', () => {
    it('次レベル必要経験値を二乗で計算する', () => {
      expect(expRequiredForNextLevel(1)).to.equal(4);
      expect(expRequiredForNextLevel(2)).to.equal(9);
      expect(expRequiredForNextLevel(3)).to.equal(16);
    });

    it('0以下の level は 1 として正規化する', () => {
      expect(expRequiredForNextLevel(0)).to.equal(4);
      expect(expRequiredForNextLevel(-10)).to.equal(4);
    });

    it('小数レベル入力を切り捨てて計算する', () => {
      expect(expRequiredForNextLevel(1.9)).to.equal(4);
      expect(expRequiredForNextLevel(2.1)).to.equal(9);
    });
  });

  describe('applyExpGain', () => {
    it('レベルアップ直前ではレベルを維持する', () => {
      const result = applyExpGain(1, 3, 0);

      expect(result.level).to.equal(1);
      expect(result.expInLevel).to.equal(3);
    });

    it('しきい値ちょうどで1レベルアップする', () => {
      const result = applyExpGain(1, 3, 1);

      expect(result.level).to.equal(2);
      expect(result.expInLevel).to.equal(0);
    });

    it('十分な経験値で複数レベルアップする', () => {
      const result = applyExpGain(1, 3, 10);

      expect(result.level).to.equal(3);
      expect(result.expInLevel).to.equal(0);
    });

    it('負値や小数入力を正規化して処理する', () => {
      const result = applyExpGain(0.2, -5, 5.9);

      expect(result.level).to.equal(2);
      expect(result.expInLevel).to.equal(1);
    });

    it('負の gainedExp は 0 として扱う', () => {
      const result = applyExpGain(2, 5, -100);

      expect(result.level).to.equal(2);
      expect(result.expInLevel).to.equal(5);
    });
  });

  describe('remainingExpToNextLevel', () => {
    it('次レベルまでの残り経験値を返す', () => {
      expect(remainingExpToNextLevel(2, 4)).to.equal(5);
    });

    it('0以下や小数の level を正規化して扱う', () => {
      expect(remainingExpToNextLevel(0.2, 1.9)).to.equal(3);
      expect(remainingExpToNextLevel(-10, 1)).to.equal(3);
    });

    it('負の expInLevel を 0 として扱う', () => {
      expect(remainingExpToNextLevel(2, -5)).to.equal(9);
    });

    it('必要値以上の expInLevel では 0 を返す', () => {
      expect(remainingExpToNextLevel(1, 10)).to.equal(0);
    });
  });
};
