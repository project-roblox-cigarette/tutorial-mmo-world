import { Workspace } from '@rbxts/services';
import { ATTRS } from 'shared/constants';
import type { AreaLevel } from 'shared/types/enemy';
import { getAreaSpawnConfig } from 'shared/utils/enemies';
import { logger } from 'shared/utils/logger';
import { toAreaLevel } from 'shared/utils/type-guards';
import { BaseService } from '../../../core/Service';
import { resolveEnemyAreaByPlaceKey } from '../utils/area-resolver';
import { PlayerSpawner } from './PlayerSpawner';

// 指定した名前のFolderをparent内に取得、なければ作成して返す
function getOrCreateFolder(parent: Instance, name: string): Folder {
  const found = parent.FindFirstChild(name);
  if (found?.IsA('Folder')) return found;
  const f = new Instance('Folder');
  f.Name = name;
  f.Parent = parent;
  return f;
}

// エリア情報からスポーン設定を解決する
function resolveSpawnConfigFromArea(area: BasePart):
  | {
      areaId: string;
      areaLevel: AreaLevel;
      spawnConfig: ReturnType<typeof getAreaSpawnConfig>;
    }
  | undefined {
  const areaIdAttr = area.GetAttribute(ATTRS.AREA_ID);
  const areaLevelAttr = area.GetAttribute(ATTRS.AREA_LEVEL);

  if (!typeIs(areaIdAttr, 'string')) return undefined;
  if (!typeIs(areaLevelAttr, 'number')) return undefined;

  const areaLevel = toAreaLevel(areaLevelAttr);
  if (!areaLevel) return undefined;

  const spawnConfig = getAreaSpawnConfig(areaIdAttr, areaLevel);
  if (!spawnConfig) return undefined;

  return { areaId: areaIdAttr, areaLevel, spawnConfig };
}

// 敵スポーン管理サービス
export class EnemySpawnService extends BaseService {
  private readonly _enemiesFolder = getOrCreateFolder(Workspace, 'Enemies');
  private readonly _spawners = new Map<number, PlayerSpawner>(); // userId -> spawner

  constructor() {
    super('EnemySpawn');
  }

  // プレイヤーのスポーン状態を更新
  public updateSpawnStateByPlayer(player: Player, placeKey: string): void {
    const spawner = this._spawners.get(player.UserId);
    if (!spawner) {
      logger.warn('EnemySpawn', `${player.Name} のスポーナーがありません`);
      return;
    }

    const area = resolveEnemyAreaByPlaceKey(placeKey);
    logger.debug(
      'EnemySpawn',
      `スポーン状態を更新: player=${player.Name} area=${area ? area.GetFullName() : 'none'}`,
    );

    if (!area) {
      // 敵エリア外ならストップ
      spawner.stop();
      return;
    }

    // すでに同じエリアでスポーンを開始している場合は何もしない
    if (spawner.isRunningIn(area)) return;

    // area更新して開始
    spawner.stop();
    spawner.setArea(area);
    spawner.start();

    const resolved = resolveSpawnConfigFromArea(area);
    if (resolved?.spawnConfig) {
      logger.info(
        'EnemySpawn',
        `スポーン開始: player=${player.Name} areaId=${resolved.areaId} areaLevel=${resolved.areaLevel} template=${resolved.spawnConfig.templateName}`,
      );
    } else {
      const areaId = area.GetAttribute(ATTRS.AREA_ID);
      const level = area.GetAttribute(ATTRS.AREA_LEVEL);
      logger.warn(
        'EnemySpawn',
        `未解決の設定でスポーン開始: player=${player.Name} area=${areaId} level=${level}`,
      );
    }
  }

  // プレイヤーが参加したときの処理
  public onPlayerAdded(player: Player): void {
    const spawner = new PlayerSpawner(player, this._enemiesFolder);
    this._spawners.set(player.UserId, spawner);
  }

  // プレイヤーが離脱したときの処理
  public onPlayerRemoving(player: Player): void {
    const spawner = this._spawners.get(player.UserId);
    if (spawner) spawner.stop();

    // 本番環境用の敵削除処理
    for (const child of this._enemiesFolder.GetChildren()) {
      if (!child.IsA('Model')) continue;
      const owner = child.GetAttribute(ATTRS.OWNER_USER_ID);
      if (typeIs(owner, 'number') && owner === player.UserId) {
        child.Destroy();
      }
    }

    // spawnerを削除
    this._spawners.delete(player.UserId);
  }

  // プレイヤーの敵を全部削除、スポーン停止
  public despawnAllForPlayer(player: Player): void {
    const spawner = this._spawners.get(player.UserId);
    if (spawner) spawner.reset();
  }
}

export const enemySpawnService = new EnemySpawnService();
