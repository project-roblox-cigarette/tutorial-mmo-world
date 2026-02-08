/**
 * サービス基盤クラス
 * - 全サービスの共通インターフェースと基底クラス
 * - ライフサイクル管理とログ出力を提供
 */

import { logger } from 'shared/utils/logger';

/**
 * 全サービスのインターフェース
 */
export interface IService {
  /**
   * サービスを起動
   */
  start(): void;

  /**
   * サービスを停止（オプション）
   */
  stop?(): void;
}

/**
 * 全サービスの基底クラス
 * ライフサイクル管理とログ出力などの共通機能を提供
 */
export abstract class BaseService implements IService {
  private _started = false;
  protected readonly _serviceName: string;

  constructor(serviceName?: string) {
    this._serviceName = serviceName ?? 'Service';
  }

  /**
   * ログ出力用のサービス名を取得
   * カスタム名を提供する場合はオーバーライド
   */
  protected getServiceName(): string {
    return this._serviceName;
  }

  /**
   * サービスを起動
   * 二重起動を防止し、起動イベントをログ出力
   */
  public start(): void {
    if (this._started) {
      logger.warn(
        this.getServiceName(),
        'サービスは既に起動済みです。重複するstart()を無視します',
      );
      return;
    }

    this._started = true;
    logger.info(this.getServiceName(), 'サービスを起動しました');
  }

  /**
   * サービスを停止（オプション）
   */
  public stop?(): void;

  /**
   * サービスが起動しているかどうかを確認
   */
  protected isStarted(): boolean {
    return this._started;
  }
}
