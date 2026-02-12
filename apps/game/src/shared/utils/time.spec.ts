/**
 * time.tsのテスト
 */

/// <reference types="@rbxts/testez/globals" />

import { getCurrentTimestamp, waitSeconds } from './time';

export = () => {
  describe('getCurrentTimestamp', () => {
    it('正の数値を返す', () => {
      const timestamp = getCurrentTimestamp();
      expect(typeIs(timestamp, 'number')).to.equal(true);
      expect(timestamp > 0).to.equal(true);
    });

    it('整数を返す', () => {
      const timestamp = getCurrentTimestamp();
      expect(math.floor(timestamp)).to.equal(timestamp);
    });

    it('時間経過とともに増加する値を返す', () => {
      const timestamp1 = getCurrentTimestamp();
      task.wait(1);
      const timestamp2 = getCurrentTimestamp();
      expect(timestamp2 >= timestamp1).to.equal(true);
    });
  });

  describe('waitSeconds', () => {
    it('指定時間後に解決される', async () => {
      const startTime = os.clock();
      await waitSeconds(0.1);
      const endTime = os.clock();
      const elapsed = endTime - startTime;

      // タイミングの誤差を許容
      expect(elapsed >= 0.09).to.equal(true);
      expect(elapsed <= 0.2).to.equal(true);
    });

    it('Promiseを返す', () => {
      const result = waitSeconds(0);
      expect(typeIs(result, 'table')).to.equal(true);
    });
  });
};
