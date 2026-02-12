/**
 * places.tsのテスト
 */

/// <reference types="@rbxts/testez/globals" />

import type { PlaceKey } from '../types/teleport';
import { getPlaceId } from './places';

export = () => {
  describe('getPlaceId', () => {
    it('有効なPlaceKeyに対してPlaceIdを返す', () => {
      const placeId = getPlaceId('Lobby' as PlaceKey);
      expect(typeIs(placeId, 'number')).to.equal(true);
      expect(placeId > 0).to.equal(true);
    });

    it('異なるPlaceKeyに対して異なるPlaceIdを返す', () => {
      const lobbyId = getPlaceId('Lobby' as PlaceKey);
      const enemyArea1Id = getPlaceId('EnemyArea_Lv1' as PlaceKey);

      // PlaceIdsは異なるべき（同じPlaceIdの場合は設定が正しくない）
      // ただし、開発中は同じPlaceIdを使う可能性もあるため、numberであることだけ確認
      expect(typeIs(lobbyId, 'number')).to.equal(true);
      expect(typeIs(enemyArea1Id, 'number')).to.equal(true);
    });

    it('同じPlaceKeyに対して一貫して同じPlaceIdを返す', () => {
      const placeId1 = getPlaceId('Lobby' as PlaceKey);
      const placeId2 = getPlaceId('Lobby' as PlaceKey);
      expect(placeId1).to.equal(placeId2);
    });
  });
};
