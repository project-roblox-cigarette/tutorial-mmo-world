/**
 * テレポート可能な場所のキー
 *
 * 注意: PLACES 定数（shared/Places.ts）のキーと同期する必要があります。
 * 新しい場所を追加する際は、両方を更新してください。
 */
export type PlaceKey =
  | 'Lobby'
  | 'EnemyArea_Lv1'
  | 'EnemyArea_Lv2'
  | 'EnemyArea_Lv3';

export type TeleportRequest = {
  player: Player;
  destination: PlaceKey;
};

export type TeleportResponse =
  | { status: true }
  | { status: false; reason: 'TELEPORT_ERROR'; detail: string };
