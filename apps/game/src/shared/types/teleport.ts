/**
 * テレポートシステム関連の型定義
 */

/**
 * テレポート可能な場所のキー
 *
 * 注意: PLACES 定数（shared/constants/places.ts）のキーと同期する必要があります。
 * 新しい場所を追加する際は、両方を更新してください。
 */
export type PlaceKey =
  | 'Lobby'
  | 'EnemyArea_Lv1'
  | 'EnemyArea_Lv2'
  | 'EnemyArea_Lv3';

/**
 * テレポートリクエスト
 */
export type TeleportRequest = {
  /** テレポートするプレイヤー */
  player: Player;
  /** テレポート先のPlaceKey */
  destination: PlaceKey;
};

/**
 * テレポートレスポンス
 * 成功時はstatus: true、失敗時はエラー理由と詳細を含む
 */
export type TeleportResponse =
  | { status: true }
  | { status: false; reason: 'TELEPORT_ERROR'; detail: string };
