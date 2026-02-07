import type { PlaceKey } from '../types/teleport';

/**
 * ワープ先一覧
 * Studio側の属性、Destinationにキーを設定する
 *
 * 注意: PlaceKey 型（types/teleport.ts）と同期する必要があります
 * 新しい場所を追加する際は、両方を更新してください
 */
export const PLACES = {
  Lobby: {
    placeId: 106990103180926,
    displayName: 'Lobby',
  },
  EnemyArea_Lv1: {
    placeId: 124280982303998,
    displayName: 'EnemyArea - Lv1',
  },
  EnemyArea_Lv2: {
    placeId: 76297845057406,
    displayName: 'EnemyArea - Lv2',
  },
  EnemyArea_Lv3: {
    placeId: 72150023649118,
    displayName: 'EnemyArea - Lv3',
  },
} as const;

/**
 * デバッグ用ワープ座標一覧
 * Studio環境でのテレポート先座標
 */
export const DEBUG_WARP_POS: Partial<Record<PlaceKey, Vector3>> = {
  Lobby: new Vector3(0, 5, 0),
  EnemyArea_Lv1: new Vector3(-100, 0.5, -250),
  EnemyArea_Lv2: new Vector3(50, 0.5, -250),
  EnemyArea_Lv3: new Vector3(200, 0.5, -250),
};
