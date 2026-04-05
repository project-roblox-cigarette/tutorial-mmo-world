import { logger } from 'shared/utils/logger';
import { initializePlayerCharacterHealth } from '../../features/player/services/PlayerHealthService';

/**
 * プレイヤーのキャラクターが追加されたときに呼び出されるハンドラー
 * @param player プレイヤー
 * @param character プレイヤーのモデル
 */
export function onCharacterAdded(player: Player, character: Model): void {
  // キャラクターのHPを初期化
  initializePlayerCharacterHealth(player, character);

  logger.debug('PlayerHealth', `HP 初期化: player=${player.Name}`);
}
