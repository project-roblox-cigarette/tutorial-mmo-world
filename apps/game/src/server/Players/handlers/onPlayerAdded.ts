import { logger } from 'shared/utils/logger';
import { ATTRIBUTES } from '../../../shared/constants';
import { enemySpawnService } from '../../features/enemy/services/EnemySpawnService';
import { initializePlayerData } from '../../services/PlayerDataService';

/**
 * プレイヤー参加時の処理
 * @param player 参加したプレイヤー
 */
export function onPlayerAdded(player: Player): void {
  logger.info('PlayerJoin', `${player.Name} が参加しました`);

  // プレイヤーデータを初期化
  const data = initializePlayerData(player);

  // 敵スポーンサービスに通知
  enemySpawnService.onPlayerAdded(player);

  // プレイヤー属性を初期化
  player.SetAttribute(ATTRIBUTES.Money, data.Money);

  logger.info(
    'PlayerJoin',
    `プレイヤーデータを初期化: ${data.DisplayName} (レベル: ${data.Level})`,
  );
}
