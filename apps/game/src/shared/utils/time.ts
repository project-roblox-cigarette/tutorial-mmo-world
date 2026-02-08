/**
 * 時間関連のユーティリティ関数
 */

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
