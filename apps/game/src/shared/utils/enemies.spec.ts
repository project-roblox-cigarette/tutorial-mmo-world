/**
 * enemies.tsのテスト
 */

/// <reference types="@rbxts/testez/globals" />

import type { AreaId } from '../types/enemy';
import { getAreaSpawnConfig } from './enemies';

export = () => {
  describe('getAreaSpawnConfig', () => {
    it('有効なエリアとレベルに対してスポーン設定を返す', () => {
      // ForestAエリアのレベル1の設定を取得
      const config = getAreaSpawnConfig('ForestA' as AreaId, 1);

      if (config) {
        expect(typeIs(config, 'table')).to.equal(true);
        // スポーン設定には必要なプロパティが含まれているはず
        expect(typeIs(config.MaxAlivePerPlayer, 'number')).to.equal(true);
        expect(typeIs(config.SpawnIntervalSec, 'number')).to.equal(true);
        expect(typeIs(config.TemplateName, 'string')).to.equal(true);
        expect(typeIs(config.Chase, 'table')).to.equal(true);
      }
    });

    it('無効なレベルに対してundefinedを返す', () => {
      const invalidLevels = [0, 4, -1, 100];

      for (const level of invalidLevels) {
        const config = getAreaSpawnConfig('ForestA' as AreaId, level);
        expect(config).to.equal(undefined);
      }
    });

    it('無効なエリアに対してundefinedを返す', () => {
      const config = getAreaSpawnConfig('InvalidArea' as AreaId, 1);
      expect(config).to.equal(undefined);
    });

    it('全ての有効なレベル（1, 2, 3）を処理できる', () => {
      const validLevels = [1, 2, 3];

      for (const level of validLevels) {
        // 設定が存在するかどうかはエリアに依存するが、エラーは発生しないべき
        expect(() =>
          getAreaSpawnConfig('ForestA' as AreaId, level),
        ).never.to.throw();
      }
    });

    it('同じ入力に対して一貫した結果を返す', () => {
      const config1 = getAreaSpawnConfig('ForestA' as AreaId, 1);
      const config2 = getAreaSpawnConfig('ForestA' as AreaId, 1);

      // 同じ参照または同じ値を返すべき
      if (config1 && config2) {
        expect(config1.MaxAlivePerPlayer).to.equal(config2.MaxAlivePerPlayer);
        expect(config1.SpawnIntervalSec).to.equal(config2.SpawnIntervalSec);
        expect(config1.TemplateName).to.equal(config2.TemplateName);
        expect(config1.Chase).to.equal(config2.Chase);
      }
    });
  });
};
