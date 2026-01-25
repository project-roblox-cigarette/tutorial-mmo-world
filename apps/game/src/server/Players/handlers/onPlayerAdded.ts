// プレイヤー参加時の処理

import { enemySpawnService } from '../../features/enemy/EnemySpawnService';
import { initializePlayerData } from '../../services/PlayerDataService';

export function onPlayerAdded(player: Player): void {
  print(`[Server] ${player.Name} が参加しました`);

  // プレイヤーデータを初期化
  const data = initializePlayerData(player);

  // 敵スポーンサービスに通知
  enemySpawnService.onPlayerAdded(player);

  print(
    `[Server] プレイヤーデータを初期化: ${data.displayName} (Level: ${data.level})`,
  );
}
