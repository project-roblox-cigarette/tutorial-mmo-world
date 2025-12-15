// 共通ユーティリティ関数

/**
 * 値がnilでないことを確認するアサーション
 */
export function assertDefined<T>(
  value: T | undefined,
  message?: string,
): asserts value is T {
  if (value === undefined) {
    throw `Assertion failed: ${message ?? 'Value is undefined'}`;
  }
}

/**
 * 配列をシャッフル（Fisher-Yatesアルゴリズム）
 */
export function shuffleArray<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.size() - 1; i > 0; i--) {
    const j = math.floor(math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 指定時間待機するPromise
 */
export function waitSeconds(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    task.delay(seconds, () => resolve());
  });
}
