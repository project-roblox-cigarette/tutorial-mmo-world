/**
 * enemy.tsの型関連のテスト
 */

/// <reference types="@rbxts/testez/globals" />

import { getEnemyType, isEnemyType } from './enemy';

export = () => {
  describe('isEnemyType', () => {
    it('有効なEnemyTypeに対してtrueを返す', () => {
      expect(isEnemyType('Chase')).to.equal(true);
      expect(isEnemyType('Patrol')).to.equal(true);
      expect(isEnemyType('Ranged')).to.equal(true);
    });

    it('無効な文字列に対してfalseを返す', () => {
      expect(isEnemyType('Invalid')).to.equal(false);
      expect(isEnemyType('chase')).to.equal(false); // 大文字小文字を区別
      expect(isEnemyType('')).to.equal(false);
      expect(isEnemyType('Attack')).to.equal(false);
    });

    it('文字列以外の値に対してfalseを返す', () => {
      expect(isEnemyType(123)).to.equal(false);
      expect(isEnemyType(undefined)).to.equal(false);
      expect(isEnemyType(true)).to.equal(false);
      expect(isEnemyType({})).to.equal(false);
    });
  });

  describe('getEnemyType', () => {
    it('有効なEnemyType attributeを取得できる', () => {
      const model = new Instance('Model');
      model.SetAttribute('EnemyType', 'Patrol');

      expect(getEnemyType(model)).to.equal('Patrol');

      model.Destroy();
    });

    it('存在しない場合はデフォルト値Chaseを返す', () => {
      const model = new Instance('Model');

      expect(getEnemyType(model)).to.equal('Chase');

      model.Destroy();
    });

    it('無効な値の場合はデフォルト値Chaseを返す', () => {
      const model = new Instance('Model');
      model.SetAttribute('EnemyType', 'InvalidType');

      expect(getEnemyType(model)).to.equal('Chase');

      model.Destroy();
    });

    it('カスタムデフォルト値を指定できる', () => {
      const model = new Instance('Model');

      expect(getEnemyType(model, 'Ranged')).to.equal('Ranged');

      model.Destroy();
    });

    it('数値など文字列以外が設定されている場合もデフォルト値を返す', () => {
      const model = new Instance('Model');
      model.SetAttribute('EnemyType', 123);

      expect(getEnemyType(model)).to.equal('Chase');

      model.Destroy();
    });
  });
};
