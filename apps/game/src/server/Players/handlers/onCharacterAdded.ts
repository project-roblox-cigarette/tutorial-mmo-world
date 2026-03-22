import { getPlayerMaxHpByLevel } from 'shared/constants';
import { logger } from 'shared/utils/logger';
import { initializeHealth } from 'src/server/features/combat/utils/health';
import { getPlayerData } from '../../services/PlayerDataService';

export function onCharacterAdded(player: Player, character: Model): void {
  const data = getPlayerData(player.UserId);

  if (!data) {
    logger.warn(
      'PlayerHealth',
      `PlayerData が見つからないため HP 初期化をスキップ: userId=${player.UserId}`,
    );
    return;
  }

  const maxHp = getPlayerMaxHpByLevel(data.Level);
  initializeHealth(character, maxHp);

  logger.debug(
    'PlayerHealth',
    `HP 初期化: player=${player.Name} level=${data.Level} hp=${maxHp}`,
  );
}
