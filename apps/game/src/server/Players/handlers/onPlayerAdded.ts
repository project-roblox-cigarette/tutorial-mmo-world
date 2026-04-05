import { ATTRIBUTES } from 'shared/constants';
import { logger } from 'shared/utils/logger';
import { enemySpawnService } from '../../features/enemy/services/EnemySpawnService';
import { initializePlayerData } from '../../services/PlayerDataService';
import { onCharacterAdded } from './onCharacterAdded';

/**
 * プレイヤーが参加したときの処理
 * @param player 参加したプレイヤー
 */
export function onPlayerAdded(player: Player): void {
  logger.info('PlayerJoin', `${player.Name} が参加しました`);

  // プレイヤーデータを初期化
  const data = initializePlayerData(player);

  // キャラクターが追加されたときのイベントを設定
  player.CharacterAdded.Connect((character) => {
    onCharacterAdded(player, character);
  });

  // すでにキャラクターが存在する場合は即座にHPを初期化
  if (player.Character) {
    onCharacterAdded(player, player.Character);
  }

  // 敵スポーン管理サービスにプレイヤーの参加を通知
  enemySpawnService.onPlayerAdded(player);

  // プレイヤー属性を初期化
  player.SetAttribute(ATTRIBUTES.Money, data.Money);

  logger.info(
    'PlayerJoin',
    `プレイヤーデータを初期化: ${data.DisplayName} (レベル: ${data.Level})`,
  );
}
