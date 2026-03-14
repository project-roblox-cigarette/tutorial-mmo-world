import { ATTRIBUTES } from 'shared/constants';
import { Result } from 'shared/types/result';
import { logger } from 'shared/utils/logger';
import {
  getPlayerData,
  updatePlayerData,
} from '../../../services/PlayerDataService';

export type MoneyError =
  | 'PlayerDataNotFound'
  | 'InvalidAmount'
  | 'InsufficientFunds';

/**
 * 正の整数に変換された金額を返す
 * @param amount 変換する金額
 * @returns 正の整数に変換された金額
 */
function normalizeMoneyAmount(amount: number): number {
  return math.max(0, math.floor(amount));
}

/**
 * プレイヤーの所持金属性を同期する
 * @param player プレイヤー
 * @param amount 同期する金額
 */
function syncMoneyAttribute(player: Player, amount: number): void {
  player.SetAttribute(ATTRIBUTES.Money, amount);
}

/**
 * プレイヤーの所持金データを取得する
 * @param player プレイヤー
 * @returns プレイヤーの所持金データ
 */
function requireMoneyData(player: Player) {
  return getPlayerData(player.UserId);
}

/**
 * プレイヤーのデータを取得する
 * @param player プレイヤー
 * @returns プレイヤーのデータ
 */
function requirePlayerData(player: Player) {
  return getPlayerData(player.UserId);
}

/**
 * プレイヤーの所持金を取得する
 * @param player プレイヤー
 * @returns プレイヤーの所持金
 */
export function getMoney(player: Player): number | undefined {
  const data = getPlayerData(player.UserId);
  return data?.Money;
}

/**
 * プレイヤーが指定した金額を支払えるかどうかを確認する
 * @param player プレイヤー
 * @param amount 確認する金額
 * @returns 支払える場合は true、そうでない場合は false
 */
export function canAfford(player: Player, amount: number): boolean {
  const normalized = normalizeMoneyAmount(amount);
  const currentMoney = getMoney(player);

  if (currentMoney === undefined) return false;
  return currentMoney >= normalized;
}

/**
 * プレイヤーの所持金を設定する
 * @param player プレイヤー
 * @param amount 設定する金額
 * @returns 設定後の所持金、またはエラー
 */
export function setMoney(
  player: Player,
  amount: number,
): Result<number, MoneyError> {
  const data = requirePlayerData(player);
  if (!data) {
    return Result.failure('PlayerDataNotFound');
  }

  const normalized = normalizeMoneyAmount(amount);
  const updated = updatePlayerData(player.UserId, { Money: normalized });
  if (!updated) {
    return Result.failure('PlayerDataNotFound');
  }

  syncMoneyAttribute(player, normalized);
  logger.info(
    'MoneyService',
    `${player.Name} の所持金を設定: ${updated.Money}`,
  );

  return Result.success(updated.Money);
}

/**
 * プレイヤーの所持金を増やす
 * @param player プレイヤー
 * @param amount 増やす金額
 * @returns 増加後の所持金、またはエラー
 */
export function addMoney(
  player: Player,
  amount: number,
): Result<number, MoneyError> {
  const data = requireMoneyData(player);
  if (!data) {
    return Result.failure('PlayerDataNotFound');
  }

  const normalized = normalizeMoneyAmount(amount);
  if (normalized <= 0) {
    return Result.failure('InvalidAmount');
  }

  return setMoney(player, data.Money + normalized);
}

/**
 * プレイヤーの所持金を減らす
 * @param player プレイヤー
 * @param amount 減らす金額
 * @returns 減少後の所持金、またはエラー
 */
export function spendMoney(
  player: Player,
  amount: number,
): Result<number, MoneyError> {
  const data = requireMoneyData(player);
  if (!data) {
    return Result.failure('PlayerDataNotFound');
  }

  const normalized = normalizeMoneyAmount(amount);
  if (normalized <= 0) {
    return Result.failure('InvalidAmount');
  }

  if (data.Money < normalized) {
    return Result.failure('InsufficientFunds');
  }

  return setMoney(player, data.Money - normalized);
}
