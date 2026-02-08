/**
 * 数値計算関連のユーティリティ関数
 */

/**
 * 値を指定範囲内に制限する
 * @param value 制限する値
 * @param min 最小値
 * @param max 最大値
 * @returns 制限された値
 */
export function clamp(value: number, min: number, max: number): number {
  return math.max(min, math.min(max, value));
}

/**
 * 2つの値間を線形補間する
 * @param a 開始値
 * @param b 終了値
 * @param t 補間係数（0-1）
 * @returns 補間された値
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * ランダムな整数を生成（min以上max以下）
 * @param min 最小値（含む）
 * @param max 最大値（含む）
 * @returns ランダムな整数
 */
export function randomInt(min: number, max: number): number {
  return math.floor(math.random() * (max - min + 1)) + min;
}
