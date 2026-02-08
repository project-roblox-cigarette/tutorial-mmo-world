// プレイヤー退出時の処理

import { logger } from 'shared/utils/logger';
import { enemySpawnService } from '../../features/enemy/services/EnemySpawnService';
import {
  getPlayerData,
  removePlayerData,
} from '../../services/PlayerDataService';

export function onPlayerRemoving(player: Player): void {
  const data = getPlayerData(player.UserId);

  // 敵スポーンサービスに通知
  enemySpawnService.onPlayerRemoving(player);

  if (data) {
    logger.info(
      'PlayerLeave',
      `${player.Name} が退出しました (最終スコア: ${data.Score}, レベル: ${data.Level})`,
    );
    // TODO: ここでデータを保存（DataStoreへ）

    removePlayerData(player.UserId);
  } else {
    logger.info('PlayerLeave', `${player.Name} が退出しました`);
  }
}
