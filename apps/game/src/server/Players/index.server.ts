/**
 * プレイヤー管理のエントリーポイント
 * - PlayerAdded/PlayerRemovingイベントのハンドラ登録
 * - テレポートハンドラの初期化
 * - 既存プレイヤーの初期化処理
 */

import { Players } from '@rbxts/services';
import { logger } from 'shared/utils/logger';
import { onPlayerAdded } from './handlers/onPlayerAdded';
import { onPlayerRemoving } from './handlers/onPlayerRemoving';
import { initTeleportHandler } from './handlers/onTeleportHandler';

// プレイヤー参加イベント
Players.PlayerAdded.Connect(onPlayerAdded);

// プレイヤー退出イベント
Players.PlayerRemoving.Connect(onPlayerRemoving);

// テレポートハンドラの初期化
initTeleportHandler();

// 既に参加しているプレイヤーの処理
// （スクリプトロード前に参加済みのプレイヤー対応）
const existingPlayers = Players.GetPlayers();
if (existingPlayers.size() > 0) {
  logger.debug(
    'PlayerManager',
    `既存プレイヤーを初期化: ${existingPlayers.size()}人`,
  );
  for (const player of existingPlayers) {
    task.spawn(() => onPlayerAdded(player));
  }
}
