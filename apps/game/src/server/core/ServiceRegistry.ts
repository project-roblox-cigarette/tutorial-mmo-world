import { logger } from 'shared/utils/logger';
import type { IService } from './Service';

/**
 * サービスライフサイクル管理レジストリ
 * - サービスの集中登録と初期化を提供
 */
class ServiceRegistryClass {
  private readonly _services = new Map<string, IService>();
  private _started = false;

  /**
   * サービスを登録
   * @param name サービスの一意な名前
   * @param service サービスインスタンス
   */
  public register(name: string, service: IService): void {
    if (this._started) {
      logger.warn(
        'ServiceRegistry',
        `startAll() 呼び出し後はサービス '${name}' を登録できません`,
      );
      return;
    }

    if (this._services.has(name)) {
      logger.warn(
        'ServiceRegistry',
        `サービス '${name}' は既に登録済みです。上書きします`,
      );
    }

    this._services.set(name, service);
    logger.debug('ServiceRegistry', `サービスを登録: ${name}`);
  }

  /**
   * サービスを名前で取得
   * @param name サービス名
   * @returns サービスインスタンス、見つからない場合はundefined
   */
  public get<T extends IService>(name: string): T | undefined {
    return this._services.get(name) as T | undefined;
  }

  /**
   * 全ての登録済みサービスを起動
   * - 登録順にサービスが起動される
   */
  public startAll(): void {
    if (this._started) {
      logger.warn('ServiceRegistry', 'サービスは既に起動済みです');
      return;
    }

    logger.info(
      'ServiceRegistry',
      `${this._services.size()} 個のサービスを起動中...`,
    );

    let successCount = 0;
    let errorCount = 0;

    for (const [name, service] of this._services) {
      const [ok, err] = pcall(() => {
        service.start();
      });

      if (!ok) {
        errorCount++;
        logger.error(
          'ServiceRegistry',
          `サービス '${name}' の起動に失敗: ${tostring(err)}`,
        );
      } else {
        successCount++;
        logger.debug('ServiceRegistry', `サービスを起動: ${name}`);
      }
    }

    this._started = true;
    logger.info(
      'ServiceRegistry',
      `サービス初期化完了: ${successCount} 成功, ${errorCount} 失敗`,
    );
  }

  /**
   * 全ての登録済みサービスを停止
   * - 登録順の逆順にサービスが停止される
   */
  public stopAll(): void {
    if (!this._started) {
      logger.warn('ServiceRegistry', 'サービスはまだ起動していません');
      return;
    }

    logger.info(
      'ServiceRegistry',
      `${this._services.size()} 個のサービスを停止中...`,
    );

    const entries: Array<[string, IService]> = [];
    for (const [name, service] of this._services) {
      entries.push([name, service]);
    }

    // 逆順にする
    for (let i = entries.size() - 1; i >= 0; i--) {
      const [name, service] = entries[i];
      // stopメソッドがあれば呼び出す
      const [ok, err] = pcall(() => {
        if ('stop' in service) {
          const svc = service as { stop: () => void };
          svc.stop();
        }
      });

      if (!ok) {
        logger.error(
          'ServiceRegistry',
          `サービス '${name}' の停止に失敗: ${tostring(err)}`,
        );
      } else if ('stop' in service) {
        logger.debug('ServiceRegistry', `サービスを停止: ${name}`);
      }
    }

    this._started = false;
    logger.info('ServiceRegistry', '全てのサービスを停止しました');
  }

  /**
   * 全ての登録済みサービスをクリア
   * - 警告: サービスは停止されません。先にstopAll()を呼び出してください
   */
  public clear(): void {
    if (this._started) {
      logger.warn(
        'ServiceRegistry',
        'サービスが実行中の状態でクリアしています',
      );
    }

    this._services.clear();
    this._started = false;
    logger.debug('ServiceRegistry', 'サービスレジストリをクリアしました');
  }

  /**
   * 全ての登録済みサービス名を取得
   */
  public getServiceNames(): string[] {
    const names: string[] = [];
    for (const [name] of this._services) {
      names.push(name);
    }
    return names;
  }
}

/**
 * サービスレジストリのシングルトンインスタンス
 */
export const ServiceRegistry = new ServiceRegistryClass();
