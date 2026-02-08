// プレイヤー参加時の処理

import { logger } from 'shared/utils/logger';
import { enemySpawnService } from '../../features/enemy/EnemySpawnService';
import { initializePlayerData } from '../../services/PlayerDataService';

export function onPlayerAdded(player: Player): void {
  logger.info('PlayerJoin', `${player.Name} が参加しました`);

  // プレイヤーデータを初期化
  const data = initializePlayerData(player);

  // 敵スポーンサービスに通知
  enemySpawnService.onPlayerAdded(player);

  logger.info(
    'PlayerJoin',
    `プレイヤーデータを初期化: ${data.displayName} (レベル: ${data.level})`,
  );
}
