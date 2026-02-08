/**
 * 統一的なエラーハンドリング用のResult型
 * - 成功した値(Ok)またはエラー(Err)のどちらかを表現
 */
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Result型のヘルパー関数を提供する名前空間
 */
export namespace Result {
  /**
   * 成功したResultを作成
   */
  export function ok<T, E = string>(value: T): Result<T, E> {
    return { ok: true, value };
  }

  /**
   * エラーのResultを作成
   */
  export function err<T, E = string>(errorValue: E): Result<T, E> {
    return { ok: false, error: errorValue };
  }

  /**
   * ResultがOkかどうかを判定する型ガード
   */
  export function isOk<T, E>(
    result: Result<T, E>,
  ): result is { ok: true; value: T } {
    return result.ok === true;
  }

  /**
   * ResultがErrかどうかを判定する型ガード
   */
  export function isErr<T, E>(
    result: Result<T, E>,
  ): result is { ok: false; error: E } {
    return result.ok === false;
  }

  /**
   * Resultをアンラップして値を返すか、エラーをthrow
   * - 注意して使用: isOk/isErrでのパターンマッチングを推奨
   */
  export function unwrap<T, E>(result: Result<T, E>): T {
    if (result.ok) {
      return result.value;
    }
    throw `Attempted to unwrap an Err result: ${result.error}`;
  }

  /**
   * Resultをアンラップして値を返すか、デフォルト値を返す
   */
  export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (result.ok) {
      return result.value;
    }
    return defaultValue;
  }

  /**
   * Resultの値を新しい値に変換
   */
  export function map<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => U,
  ): Result<U, E> {
    if (result.ok) {
      return ok(fn(result.value));
    }
    return result;
  }

  /**
   * Resultのエラーを新しいエラーに変換
   */
  export function mapErr<T, E, F>(
    result: Result<T, E>,
    fn: (errorValue: E) => F,
  ): Result<T, F> {
    if (!result.ok) {
      return err(fn(result.error));
    }
    return result;
  }

  /**
   * Resultを連鎖させる (flatMap/bind)
   */
  export function andThen<T, U, E>(
    result: Result<T, E>,
    fn: (value: T) => Result<U, E>,
  ): Result<U, E> {
    if (result.ok) {
      return fn(result.value);
    }
    return result;
  }
}
