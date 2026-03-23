import { Players } from '@rbxts/services';
import { ATTRIBUTES, getPlayerMaxHpByLevel } from 'shared/constants';
import { logger } from '../../../../shared/utils/logger';
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
  // プレイヤーを取得. 存在しない場合は処理を中止
  const player = Players.GetPlayerByUserId(userId);
  if (!player) return;

  // キャラクターを取得. 存在しない場合は処理を中止
  const character = player.Character;
  if (!character || !character.Parent) return;

  // プレイヤーデータを取得. 存在しない場合は処理を中止
  const data = getPlayerData(userId);
  if (!data) return;

  // レベルに応じた最大HPを計算
  const newMaxHp = getPlayerMaxHpByLevel(data.Level);
  const currentHp = getCurrentHp(character);
  const oldMaxHp = getMaxHp(character);

  // 現在のHPまたは最大HPが取得できない場合は初期化
  if (currentHp === undefined || oldMaxHp === undefined) {
    initializeHealth(character, newMaxHp);
    return;
  }

  // HPの増減を計算して適用
  const missingHp = math.max(0, oldMaxHp - currentHp);
  const nextHp = math.max(0, newMaxHp - missingHp);

  // キャラクターの属性とHumanoidを更新
  character.SetAttribute(ATTRIBUTES.MaxHp, newMaxHp);
  character.SetAttribute(ATTRIBUTES.Hp, nextHp);
  character.SetAttribute(ATTRIBUTES.Dead, nextHp <= 0);

  // HumanoidのHPを更新
  const humanoid = character.FindFirstChildWhichIsA('Humanoid', true);
  if (humanoid?.IsA('Humanoid')) {
    humanoid.MaxHealth = newMaxHp;
    humanoid.Health = nextHp;
    logger.debug(
      'PlayerHealth',
      `プレイヤーのHPを更新: UserId=${userId} MaxHp=${newMaxHp} Hp=${nextHp}`,
    );
  }
}
