// プレイヤー退出時の処理

import {
  getPlayerData,
  removePlayerData,
} from '../../services/PlayerDataService';

export function onPlayerRemoving(player: Player): void {
  const data = getPlayerData(player.UserId);
  if (data) {
    print(
      `[Server] ${player.Name} が退出しました (最終スコア: ${data.score}, Level: ${data.level})`,
    );
    // TODO: ここでデータを保存（DataStoreへ）

    removePlayerData(player.UserId);
  } else {
    print(`[Server] ${player.Name} が退出しました`);
  }
}
