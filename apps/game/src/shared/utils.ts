// ゲーム内共通ユーティリティ関数

/**
 * 値を指定範囲内に制限する
 */
export function clamp(value: number, min: number, max: number): number {
  return math.max(min, math.min(max, value));
}

/**
 * 2つの値間を線形補間する
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * ランダムな整数を生成（min以上max以下）
 */
export function randomInt(min: number, max: number): number {
  return math.floor(math.random() * (max - min + 1)) + min;
}

/**
 * 現在のUnixタイムスタンプを取得（秒）
 */
export function getCurrentTimestamp(): number {
  return math.floor(os.time());
}

/**
 * 指定時間待機するPromise
 */
export function waitSeconds(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    task.delay(seconds, () => resolve());
  });
}

/**
 * 数値をAreaLevel型に変換する
 * @param level 変換する数値
 * @returns AreaLevel型の値、または変換できない場合はundefined
 */
export function toAreaLevel(level: number): 1 | 2 | 3 | undefined {
  return level === 1 || level === 2 || level === 3 ? level : undefined;
}
