/// <reference types="@rbxts/testez/globals" />

import { clamp, lerp, randomInt } from 'shared/utils';
import {
  calculateLevel,
  getScoreForNextLevel,
} from '../server/services/ScoreService';

export = () => {
  describe('Math utilities', () => {
    describe('clamp', () => {
      it('値が範囲内の場合はそのまま返す', () => {
        expect(clamp(5, 0, 10)).to.equal(5);
      });

      it('値が最小値より小さい場合は最小値を返す', () => {
        expect(clamp(-5, 0, 10)).to.equal(0);
      });

      it('値が最大値より大きい場合は最大値を返す', () => {
        expect(clamp(15, 0, 10)).to.equal(10);
      });

      it('境界値を正しく処理する', () => {
        expect(clamp(0, 0, 10)).to.equal(0);
        expect(clamp(10, 0, 10)).to.equal(10);
      });
    });

    describe('lerp', () => {
      it('t=0の場合は開始値を返す', () => {
        expect(lerp(0, 100, 0)).to.equal(0);
      });

      it('t=1の場合は終了値を返す', () => {
        expect(lerp(0, 100, 1)).to.equal(100);
      });

      it('t=0.5の場合は中間値を返す', () => {
        expect(lerp(0, 100, 0.5)).to.equal(50);
      });

      it('tが範囲外の場合はクランプされる', () => {
        expect(lerp(0, 100, -1)).to.equal(0);
        expect(lerp(0, 100, 2)).to.equal(100);
      });
    });

    describe('randomInt', () => {
      it('指定範囲内の整数を返す', () => {
        for (let i = 0; i < 100; i++) {
          const result = randomInt(1, 10);
          expect(result >= 1).to.equal(true);
          expect(result <= 10).to.equal(true);
          expect(result === math.floor(result)).to.equal(true);
        }
      });
    });
  });

  describe('Score Service', () => {
    describe('calculateLevel', () => {
      it('スコア0はレベル1', () => {
        expect(calculateLevel(0)).to.equal(1);
      });

      it('スコア100はレベル2', () => {
        expect(calculateLevel(100)).to.equal(2);
      });

      it('スコア300はレベル3', () => {
        expect(calculateLevel(300)).to.equal(3);
      });

      it('境界値の直前はレベルが上がらない', () => {
        expect(calculateLevel(99)).to.equal(1);
        expect(calculateLevel(299)).to.equal(2);
      });

      it('高スコアは高レベルになる', () => {
        expect(calculateLevel(5000)).to.equal(10);
      });
    });

    describe('getScoreForNextLevel', () => {
      it('レベル1の次はスコア100が必要', () => {
        expect(getScoreForNextLevel(1)).to.equal(100);
      });

      it('レベル2の次はスコア300が必要', () => {
        expect(getScoreForNextLevel(2)).to.equal(300);
      });

      it('最大レベルの場合はundefinedを返す', () => {
        expect(getScoreForNextLevel(10)).to.equal(undefined);
      });
    });
  });
};
