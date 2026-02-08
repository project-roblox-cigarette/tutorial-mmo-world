// スコアの制限値
export const SCORES = {
  MIN: 0,
  MAX: 999999,
} as const;

// レベルアップに必要なスコア
export const LEVEL_THRESHOLDS: number[] = [
  0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500,
] as const;
