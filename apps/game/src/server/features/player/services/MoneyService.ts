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
 * 指定した金額が整数かどうかを確認する
 * @param amount 金額
 * @returns 整数の場合は true、そうでない場合は false
 */
function isIntegerAmount(amount: number): boolean {
  return math.floor(amount) === amount;
}

/**
 * 所持金そのものの値として有効かを確認する。
 *
 * 用途:
 * - setMoney() のように、最終的に保存する残高を検証するときに使う
 *
 * ルール:
 * - 整数であること
 * - 0以上であること
 *
 * @param amount 検証したい所持金の値
 * @returns 所持金として保存可能なら true
 */
function isValidMoneyValue(amount: number): boolean {
  return isIntegerAmount(amount) && amount >= 0;
}

/**
 * 取引金額として有効かを確認する。
 *
 * 用途:
 * - addMoney() / spendMoney() / canAfford() のように、
 *   「いくら増やすか」「いくら使うか」を検証するときに使う
 *
 * ルール:
 * - 整数であること
 * - 1以上であること
 *
 * @param amount 検証したい取引金額
 * @returns 取引金額として利用可能なら true
 */
function isValidTransactionAmount(amount: number): boolean {
  return isIntegerAmount(amount) && amount > 0;
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
 * プレイヤーのデータを取得する
 * @param player プレイヤー
 * @returns プレイヤーのデータ、または undefined
 */
function getRequiredPlayerData(player: Player) {
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
  if (!isValidTransactionAmount(amount)) {
    return false;
  }
  const currentMoney = getMoney(player);

  if (currentMoney === undefined) {
    return false;
  }
  return currentMoney >= amount;
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
  const data = getRequiredPlayerData(player);
  if (!data) {
    return Result.failure('PlayerDataNotFound');
  }

  if (!isValidMoneyValue(amount)) {
    return Result.failure('InvalidAmount');
  }
  const updated = updatePlayerData(player.UserId, { Money: amount });
  if (!updated) {
    return Result.failure('PlayerDataNotFound');
  }

  syncMoneyAttribute(player, amount);
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
  const data = getRequiredPlayerData(player);
  if (!data) {
    return Result.failure('PlayerDataNotFound');
  }

  if (!isValidTransactionAmount(amount)) {
    return Result.failure('InvalidAmount');
  }

  return setMoney(player, data.Money + amount);
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
  const data = getRequiredPlayerData(player);
  if (!data) {
    return Result.failure('PlayerDataNotFound');
  }

  if (!isValidTransactionAmount(amount)) {
    return Result.failure('InvalidAmount');
  }

  if (data.Money < amount) {
    return Result.failure('InsufficientFunds');
  }

  return setMoney(player, data.Money - amount);
}
