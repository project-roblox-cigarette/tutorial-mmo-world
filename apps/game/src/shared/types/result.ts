/**
 * 統一的なエラーハンドリング用のResult型
 * - 成功した値(Ok)またはエラー(Err)のどちらかを表現
 */
export type Result<T, E = string> =
  | { Success: true; Value: T }
  | { Success: false; Error: E };

/**
 * Result型のヘルパー関数を提供する名前空間
 */
export namespace Result {
  /**
   * 成功したResultを作成
   */
  export function success<T, E = string>(value: T): Result<T, E> {
    return {
      Success: true,
      Value: value,
    };
  }

  /**
   * エラーのResultを作成
   */
  export function failure<T, E = string>(errorValue: E): Result<T, E> {
    return {
      Success: false,
      Error: errorValue,
    };
  }

  /**
   * Resultが成功かどうかを判定する型ガード
   */
  export function isSuccess<T, E>(
    result: Result<T, E>,
  ): result is { Success: true; Value: T } {
    return result.Success === true;
  }

  /**
   * Resultが失敗かどうかを判定する型ガード
   */
  export function isFailure<T, E>(
    result: Result<T, E>,
  ): result is { Success: false; Error: E } {
    return result.Success === false;
  }

  /**
   * Resultをアンラップして値を返すか、エラーをthrow
   * - 注意して使用: isSuccess/isFailureでのパターンマッチングを推奨
   */
  export function unwrap<T, E>(result: Result<T, E>): T {
    if (result.Success) {
      return result.Value;
    }

    throw `Attempted to unwrap an Failure result: ${result.Error}`;
  }

  /**
   * Resultをアンラップして値を返すか、デフォルト値を返す
   */
  export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
    if (result.Success) {
      return result.Value;
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
    if (result.Success) {
      return success(fn(result.Value));
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
    if (!result.Success) {
      return failure(fn(result.Error));
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
    if (result.Success) {
      return fn(result.Value);
    }
    return result;
  }
}
