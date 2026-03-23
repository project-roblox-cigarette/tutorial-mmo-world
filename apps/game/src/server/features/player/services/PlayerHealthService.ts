import { Players } from '@rbxts/services';
import { ATTRIBUTES, getPlayerMaxHpByLevel } from 'shared/constants';
import { getPlayerData } from '../../../services/PlayerDataService';
import {
  getCurrentHp,
  getMaxHp,
  initializeHealth,
} from '../../combat/utils/health';

/**
 * プレイヤーのキャラクターのHPを初期化する
 * @param player プレイヤー
 * @param character プレイヤーのモデル
 */
export function initializePlayerCharacterHealth(
  player: Player,
  character: Model,
): void {
  const data = getPlayerData(player.UserId);
  if (!data) return;

  const maxHp = getPlayerMaxHpByLevel(data.Level);
  initializeHealth(character, maxHp);
}

/**
 * プレイヤーのキャラクターのHPをレベルに応じて同期する
 * @param userId プレイヤーのユーザーID
 */
export function syncPlayerCharacterHealthFromLevel(userId: number): void {
  const player = Players.GetPlayerByUserId(userId);
  if (!player) return;

  const character = player.Character;
  if (!character || !character.Parent) return;

  const data = getPlayerData(userId);
  if (!data) return;

  const newMaxHp = getPlayerMaxHpByLevel(data.Level);
  const currentHp = getCurrentHp(character);
  const oldMaxHp = getMaxHp(character);

  if (currentHp === undefined || oldMaxHp === undefined) {
    initializeHealth(character, newMaxHp);
    return;
  }

  const missingHp = math.max(0, oldMaxHp - currentHp);
  const nextHp = math.max(0, newMaxHp - missingHp);

  character.SetAttribute(ATTRIBUTES.MaxHp, newMaxHp);
  character.SetAttribute(ATTRIBUTES.Hp, nextHp);
  character.SetAttribute(ATTRIBUTES.Dead, nextHp <= 0);

  const humanoid = character.FindFirstChildWhichIsA('Humanoid', true);
  if (humanoid?.IsA('Humanoid')) {
    humanoid.MaxHealth = newMaxHp;
    humanoid.Health = nextHp;
  }
}
