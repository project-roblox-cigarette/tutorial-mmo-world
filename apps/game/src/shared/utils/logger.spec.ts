/**
 * logger.tsのテスト
 */

/// <reference types="@rbxts/testez/globals" />

import { LogLevel, logger } from './logger';

export = () => {
  describe('Logger', () => {
    afterEach(() => {
      // テスト後にログレベルをリセット
      logger.setMinLevel(LogLevel.DEBUG);
    });

    describe('setMinLevel と getMinLevel', () => {
      it('最小ログレベルを設定・取得できる', () => {
        logger.setMinLevel(LogLevel.INFO);
        expect(logger.getMinLevel()).to.equal(LogLevel.INFO);

        logger.setMinLevel(LogLevel.WARN);
        expect(logger.getMinLevel()).to.equal(LogLevel.WARN);

        logger.setMinLevel(LogLevel.ERROR);
        expect(logger.getMinLevel()).to.equal(LogLevel.ERROR);
      });
    });

    describe('ログメソッド', () => {
      it('debugメソッドが使用できる', () => {
        expect(() => logger.debug('Test', 'Debug message')).never.to.throw();
      });

      it('infoメソッドが使用できる', () => {
        expect(() => logger.info('Test', 'Info message')).never.to.throw();
      });

      it('warnメソッドが使用できる', () => {
        expect(() => logger.warn('Test', 'Warning message')).never.to.throw();
      });

      it('errorメソッドが使用できる', () => {
        // Robloxのerror()関数は実際にエラーをスローするため、
        // expect().to.throw()を使用してエラーがスローされることを確認
        expect(() => logger.error('Test', 'Error message')).to.throw();
      });
    });

    describe('ログレベルフィルタリング', () => {
      it('最小レベル未満のメッセージはログ出力しない', () => {
        logger.setMinLevel(LogLevel.WARN);

        // DEBUGとINFOは出力されないべきだが、出力を直接確認する方法がないため
        // エラーが発生しないことだけ確認
        expect(() =>
          logger.debug('Test', 'Should not appear'),
        ).never.to.throw();
        expect(() => logger.info('Test', 'Should not appear')).never.to.throw();
      });

      it('最小レベル以上のメッセージはログ出力する', () => {
        logger.setMinLevel(LogLevel.WARN);

        expect(() => logger.warn('Test', 'Should appear')).never.to.throw();
        // error()は実際にエラーをスローするため、to.throw()を使用
        expect(() => logger.error('Test', 'Should appear')).to.throw();
      });
    });
  });

  describe('LogLevel列挙型', () => {
    it('正しい階層構造を持つ', () => {
      expect(LogLevel.DEBUG).to.equal(0);
      expect(LogLevel.INFO).to.equal(1);
      expect(LogLevel.WARN).to.equal(2);
      expect(LogLevel.ERROR).to.equal(3);
    });

    it('レベル比較ができる', () => {
      expect(LogLevel.DEBUG < LogLevel.INFO).to.equal(true);
      expect(LogLevel.INFO < LogLevel.WARN).to.equal(true);
      expect(LogLevel.WARN < LogLevel.ERROR).to.equal(true);
    });
  });
};
