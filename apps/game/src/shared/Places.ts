// ワープ先地点の定義ファイル

// タグを統一
export const TELEPORT_PROMPT_TAG = 'TeleportPrompt' as const;

// 属性参照用
export const ATTR_DESTINATION = 'Destination' as const;

/**
 * ワープ先一覧
 * - Studio側の属性、Destinationにキーを設定する。
 */
export const PLACES = {
  Lobby: { placeId: 106990103180926, displayName: 'Lobby' },
  EnemyArea_Lv1: { placeId: 124280982303998, displayName: 'EnemyArea - Lv1' },
  EnemyArea_Lv2: { placeId: 76297845057406, displayName: 'EnemyArea - Lv2' },
  EnemyArea_Lv3: { placeId: 72150023649118, displayName: 'EnemyArea - Lv3' },
} as const;

/**
 * デバッグ用ワープ一覧
 */
export const DEBUG_WARP_POS: Partial<Record<PlaceKey, Vector3>> = {
  Lobby: new Vector3(0, 5, 0),
  EnemyArea_Lv1: new Vector3(-100, 0.5, -250),
  EnemyArea_Lv2: new Vector3(50, 0.5, -250),
  EnemyArea_Lv3: new Vector3(200, 0.5, -250),
};

// Destinationとして使用できる型をPLACESのキーのみにする
export type PlaceKey = keyof typeof PLACES;

/**
 * Studioから取得した文字列がPLACESに含まれているキーかを判定する。
 * @param value Studioから取得した文字列
 * @returns trueでPlaceKeyとして使用可能。型安全を担保する。
 */
export function isPlaceKey(value: unknown): value is PlaceKey {
  if (!typeIs(value, 'string')) return false;
  return (PLACES as Record<string, unknown>)[value] !== undefined;
}

/**
 * PlaceKeyからPlaceIdを取得。
 * @param key PlaceKey
 * @returns PlaceId
 */
export function getPlaceId(key: PlaceKey): number {
  return PLACES[key].placeId;
}
