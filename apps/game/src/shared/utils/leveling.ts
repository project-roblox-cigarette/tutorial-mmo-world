export function expRequiredForNextLevel(level: number): number {
  const currentLevel = math.max(1, math.floor(level));
  const nextLevel = currentLevel + 1;
  return nextLevel ** 2; // Lv2 = 4, Lv3 = 9, Lv4 = 16, Lv5 = 25, ...
}

/**
 * 経験値加算後の { level, expInLevel } を計算する
 * @param level 現在のレベル
 * @param expInLevel 現在のレベル内経験値
 * @param gainedExp 加算する経験値
 * @returns 加算後のレベルとレベル内経験値
 */
export function applyExpGain(
  level: number,
  expInLevel: number,
  gainedExp: number,
): { level: number; expInLevel: number } {
  let currentLevel = math.max(1, math.floor(level));
  let currentExpInLevel =
    math.max(0, math.floor(expInLevel)) + math.max(0, math.floor(gainedExp));

  while (currentExpInLevel >= expRequiredForNextLevel(currentLevel)) {
    currentExpInLevel -= expRequiredForNextLevel(currentLevel);
    currentLevel += 1;

    if (currentLevel > 10_000) break; // 無限ループ防止のセーフガード
  }

  return { level: currentLevel, expInLevel: currentExpInLevel };
}

/**
 * 次のレベルまでに必要な残り経験値を計算する
 */
export function remainingExpToNextLevel(
  level: number,
  expInLevel: number,
): number {
  const normalizedLevel = math.max(1, math.floor(level));
  const normalizedExpInLevel = math.max(0, math.floor(expInLevel));

  return math.max(
    0,
    expRequiredForNextLevel(normalizedLevel) - normalizedExpInLevel,
  );
}
