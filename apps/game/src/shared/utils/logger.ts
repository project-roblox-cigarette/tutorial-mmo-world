import { RunService } from '@rbxts/services';

/**
 * ログレベル定義
 * - DEBUG: デバッグ情報（Studio環境のみ）
 * - INFO: 一般的な情報ログ
 * - WARN: 警告
 * - ERROR: エラー
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 統一的なロギングシステム
 * - 環境に応じたログレベルの自動調整
 * - カテゴリ別のログ出力
 */
class Logger {
  private _minLevel: LogLevel;

  constructor() {
    // 環境に基づいて最小ログレベルを設定
    // Studio環境ではDEBUG以上、本番環境ではINFO以上を表示
    this._minLevel = RunService.IsStudio() ? LogLevel.DEBUG : LogLevel.INFO;
  }

  /**
   * 最小ログレベルを設定
   */
  public setMinLevel(level: LogLevel): void {
    this._minLevel = level;
  }

  /**
   * 現在の最小ログレベルを取得
   */
  public getMinLevel(): LogLevel {
    return this._minLevel;
  }

  /**
   * デバッグログ
   * - デフォルトではStudio環境でのみ表示
   */
  public debug(category: string, message: string): void {
    this._log(LogLevel.DEBUG, category, message);
  }

  /**
   * 情報ログ
   * - 標準的な情報メッセージ
   */
  public info(category: string, message: string): void {
    this._log(LogLevel.INFO, category, message);
  }

  /**
   * 警告ログ
   * - 重要ではない問題
   */
  public warn(category: string, message: string): void {
    this._log(LogLevel.WARN, category, message);
  }

  /**
   * エラーログ
   * - 重大な問題
   */
  public error(category: string, message: string): void {
    this._log(LogLevel.ERROR, category, message);
  }

  private _log(level: LogLevel, category: string, message: string): void {
    if (level < this._minLevel) {
      return;
    }

    const levelStr = this._getLevelString(level);
    const formattedMessage = `[${levelStr}] [${category}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
      case LogLevel.INFO:
        print(formattedMessage);
        break;
      case LogLevel.WARN:
        warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        error(formattedMessage);
    }
  }

  private _getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'DEBUG';
      case LogLevel.INFO:
        return 'INFO';
      case LogLevel.WARN:
        return 'WARN';
      case LogLevel.ERROR:
        return 'ERROR';
    }
  }
}

/**
 * Loggerのシングルトンインスタンス
 */
export const logger = new Logger();
