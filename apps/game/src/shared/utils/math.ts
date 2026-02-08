/**
 * 数値計算関連のユーティリティ関数
 */

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
