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
    PlaceId: 106990103180926, // ロビー
    DisplayName: 'Lobby', // ロビー
  },
  EnemyArea_Lv1: {
    PlaceId: 124280982303998, // 敵エリア_レベル1
    DisplayName: 'EnemyArea - Lv1', // 敵エリア_レベル1
  },
  EnemyArea_Lv2: {
    PlaceId: 76297845057406, // 敵エリア_レベル2
    DisplayName: 'EnemyArea - Lv2', // 敵エリア_レベル2
  },
  EnemyArea_Lv3: {
    PlaceId: 72150023649118, // 敵エリア_レベル3
    DisplayName: 'EnemyArea - Lv3', // 敵エリア_レベル3
  },
} as const;

/**
 * デバッグ用ワープ座標一覧
 * Studio環境でのテレポート先座標
 */
export const DEBUG_WARP_POS: Partial<Record<PlaceKey, Vector3>> = {
  Lobby: new Vector3(0, 5, 0), // ロビー
  EnemyArea_Lv1: new Vector3(-100, 0.5, -250), // 敵エリア_レベル1
  EnemyArea_Lv2: new Vector3(50, 0.5, -250), // 敵エリア_レベル2
  EnemyArea_Lv3: new Vector3(200, 0.5, -250), // 敵エリア_レベル3
} as const;
