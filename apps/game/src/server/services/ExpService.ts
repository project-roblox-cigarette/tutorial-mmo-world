import { applyExpGain, remainingExpToNextLevel } from 'shared/utils/leveling';
import { logger } from 'shared/utils/logger';
import { clamp } from 'shared/utils/math';
import { syncPlayerCharacterHealthFromLevel } from '../features/player/services/PlayerHealthService';
import { getPlayerData, updatePlayerData } from './PlayerDataService';

// 経験値の上限（レベルアップの計算に使用）
const EXP_LIMITS = { Min: 0, Max: 1000000 } as const;

/**
 * プレイヤーに経験値を追加するときの処理
 * @param userId プレイヤーのID
 * @param gainedExp 追加する経験値
 */
export function addExp(userId: number, gainedExp: number): void {
  // プレイヤーデータを取得. 存在しない場合は処理を中止
  const playerData = getPlayerData(userId);
  if (!playerData) return;

  // 追加する経験値が0以下の場合は処理しない
  const normalizedGainedExp = math.max(0, math.floor(gainedExp));
  if (normalizedGainedExp <= 0) return;

  const beforeExp = playerData.Exp;
  const beforeLevel = playerData.Level;
  const beforeExpInLevel = playerData.ExpInLevel;
  const afterExp = clamp(
    beforeExp + normalizedGainedExp,
    EXP_LIMITS.Min,
    EXP_LIMITS.Max,
  );
  const effectiveGainedExp = afterExp - beforeExp;

  if (effectiveGainedExp <= 0) return;

  // 現在のレベルと経験値をもとに、レベルアップの計算を行う
  const nextProgress = applyExpGain(
    beforeLevel,
    beforeExpInLevel,
    effectiveGainedExp,
  );

  // プレイヤーデータを更新
  updatePlayerData(userId, {
    Exp: afterExp,
    Level: nextProgress.level,
    ExpInLevel: nextProgress.expInLevel,
  });

  // レベルアップしたかどうかを判定
  const leveledUp = nextProgress.level > beforeLevel;

  // レベルアップした場合はHPをレベルに応じて同期
  if (leveledUp) {
    syncPlayerCharacterHealthFromLevel(userId);
  }

  // 次のレベルに到達するまでに必要な経験値を計算
  const remainingToNext = remainingExpToNextLevel(
    nextProgress.level,
    nextProgress.expInLevel,
  );

  logger.info(
    'ExpService',
    `ExpGained userId=${userId} gained=${normalizedGainedExp} effectiveGained=${effectiveGainedExp} exp=${beforeExp}->${afterExp} level=${beforeLevel}->${nextProgress.level} expInLevel=${beforeExpInLevel}->${nextProgress.expInLevel} leveledUp=${leveledUp} remainingToNext=${remainingToNext}`,
  );

  // レベルアップした場合はログに記録
  if (leveledUp) {
    logger.info(
      'ExpService',
      `Player(${userId}) LevelUp: ${beforeLevel} -> ${nextProgress.level}`,
    );
  }
}

/**
 * プレイヤーが次のレベルに到達するまでに必要な経験値を取得します。
 * @param userId プレイヤーのID
 * @returns 次のレベルに必要な経験値、またはプレイヤーデータが存在しない場合はundefined
 */
export function getRemainingExp(userId: number): number | undefined {
  const pd = getPlayerData(userId);
  if (!pd) return undefined;
  return remainingExpToNextLevel(pd.Level, pd.ExpInLevel);
}
