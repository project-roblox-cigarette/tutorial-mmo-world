/**
 * characters.tsのテスト
 *
 * Note: これらのテストはRobloxランタイムに依存するため、
 * 実際の環境または適切なモックが必要です。
 */

/// <reference types="@rbxts/testez/globals" />

import {
  getHumanoidFromModel,
  getRootPartFromModel,
  isAliveCharacter,
} from './characters';

export = () => {
  describe('getRootPartFromModel', () => {
    it('PrimaryPartが設定されている場合はそれを返す', () => {
      const model = new Instance('Model');
      const part = new Instance('Part');
      model.PrimaryPart = part;

      const result = getRootPartFromModel(model);
      expect(result).to.equal(part);

      model.Destroy();
    });

    it('PrimaryPartがなければHumanoidRootPartを探す', () => {
      const model = new Instance('Model');
      const rootPart = new Instance('Part');
      rootPart.Name = 'HumanoidRootPart';
      rootPart.Parent = model;

      const result = getRootPartFromModel(model);
      expect(result).to.equal(rootPart);

      model.Destroy();
    });

    it('どちらもない場合はundefinedを返す', () => {
      const model = new Instance('Model');

      const result = getRootPartFromModel(model);
      expect(result).to.equal(undefined);

      model.Destroy();
    });
  });

  describe('getHumanoidFromModel', () => {
    it('Humanoidがあればそれを返す', () => {
      const model = new Instance('Model');
      const humanoid = new Instance('Humanoid');
      humanoid.Parent = model;

      const result = getHumanoidFromModel(model);
      expect(result).to.equal(humanoid);

      model.Destroy();
    });

    it('Humanoidがなければundefinedを返す', () => {
      const model = new Instance('Model');

      const result = getHumanoidFromModel(model);
      expect(result).to.equal(undefined);

      model.Destroy();
    });
  });

  describe('isAliveCharacter', () => {
    it('undefinedに対してfalseを返す', () => {
      expect(isAliveCharacter(undefined)).to.equal(false);
    });

    it('Humanoidがない場合はfalseを返す', () => {
      const model = new Instance('Model');

      expect(isAliveCharacter(model)).to.equal(false);

      model.Destroy();
    });

    it('Humanoid.Health > 0の場合trueを返す', () => {
      const model = new Instance('Model');
      const humanoid = new Instance('Humanoid');
      humanoid.Parent = model;
      humanoid.Health = 100;

      expect(isAliveCharacter(model)).to.equal(true);

      model.Destroy();
    });

    it('Humanoid.Health = 0の場合falseを返す', () => {
      const model = new Instance('Model');
      const humanoid = new Instance('Humanoid');
      humanoid.Parent = model;
      humanoid.Health = 0;

      expect(isAliveCharacter(model)).to.equal(false);

      model.Destroy();
    });

    it('Humanoid.Health < 0の場合falseを返す', () => {
      const model = new Instance('Model');
      const humanoid = new Instance('Humanoid');
      humanoid.Parent = model;
      humanoid.Health = -10;

      expect(isAliveCharacter(model)).to.equal(false);

      model.Destroy();
    });
  });
};
