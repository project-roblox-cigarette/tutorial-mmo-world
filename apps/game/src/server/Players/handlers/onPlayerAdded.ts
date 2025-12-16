// プレイヤー参加時の処理

import { initializePlayerData } from '../../services/PlayerDataService';

export function onPlayerAdded(player: Player): void {
  print(`[Server] ${player.Name} が参加しました`);

  // プレイヤーデータを初期化
  const data = initializePlayerData(player);
  print(
    `[Server] プレイヤーデータを初期化: ${data.displayName} (Level: ${data.level})`,
  );
}
