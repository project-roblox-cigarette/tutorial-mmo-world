import { ServerStorage, Workspace } from '@rbxts/services';
import {
  getAreaSpawnConfig,
  toAreaLevel,
  type AreaSpawnConfig,
  type AreaLevel,
} from '../../../shared/config/EnemySpawnConfig';

import { resolveEnemyAreaByPlaceKey } from './spawn/AreaResolver';
import { getSpawnCFrameInArea } from './spawn/SpawnPosition';

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
      spawnConfig: AreaSpawnConfig;
    }
  | undefined {
  const areaIdAttr = area.GetAttribute('AreaId');
  const areaLevelAttr = area.GetAttribute('Level');

  if (!typeIs(areaIdAttr, 'string')) return undefined;
  if (!typeIs(areaLevelAttr, 'number')) return undefined;

  const areaLevel = toAreaLevel(areaLevelAttr);
  if (!areaLevel) return undefined;

  const spawnConfig = getAreaSpawnConfig(areaIdAttr, areaLevel);
  if (!spawnConfig) return undefined;

  return { areaId: areaIdAttr, areaLevel, spawnConfig };
}

// プレイヤーごとのスポーン管理クラス
class PlayerSpawner {
  private readonly _randomizer = new Random();
  private readonly _aliveEnemies = new Set<Model>();
  private _running = false;

  constructor(
    private readonly _player: Player,
    private readonly _enemiesFolder: Folder,
    private _currentArea?: BasePart,
  ) {}

  // スポーン開始
  public start(): void {
    if (this._running) return;
    this._running = true;
    this.maintain();
  }

  // スポーン停止
  public stop(): void {
    this._running = false;
    for (const m of this._aliveEnemies) m.Destroy();
    this._aliveEnemies.clear();
  }

  // スポーンエリアを設定
  public setArea(area: BasePart) {
    this._currentArea = area;
  }

  // 現在のスポーンエリアを取得
  public getArea(): BasePart | undefined {
    return this._currentArea;
  }

  // 指定エリアでスポーン中か
  public isRunningIn(area: BasePart): boolean {
    return this._running && this._currentArea === area;
  }

  // 倒されたら次をスポーンさせる維持処理
  private async maintain(): Promise<void> {
    while (this._running) {
      const area = this._currentArea;
      if (!area) {
        await task.wait(0.3);
        continue;
      }

      const resolved = resolveSpawnConfigFromArea(area);
      if (!resolved) {
        await task.wait(1);
        continue;
      }
      const { spawnConfig } = resolved;

      while (
        this._running &&
        this._aliveEnemies.size() < spawnConfig.maxAlivePerPlayer
      ) {
        const ok = this.spawnOne(spawnConfig.templateName, area);
        if (!ok) break;
        await task.wait(0.05);
      }

      await task.wait(spawnConfig.spawnIntervalSec);
    }
  }

  // 敵を1体スポーンさせる
  private spawnOne(templateName: string, area: BasePart): boolean {
    const spawnable = ServerStorage.FindFirstChild('Spawnables');

    if (!spawnable || !spawnable.IsA('Folder')) {
      // フォルダがない時
      warn(`[EnemySpawn] ServerStorage/Spawnables folder is missing`);
      return false;
    }

    const template = spawnable.FindFirstChild(templateName);

    if (!template || !template.IsA('Model')) {
      // テンプレートがない時
      const available = spawnable
        .GetChildren()
        .map((c) => c.Name)
        .join(', ');
      warn(
        `[EnemySpawn] Spawn template not found or not Model: ` +
          `requested="${templateName}" actual="${template ? template.ClassName : 'nil'}" ` +
          `available=[${available}]`,
      );
      return false;
    }

    const enemyModel = template.Clone();
    enemyModel.Name = `${template.Name}_${this._player.UserId}_${math.floor(os.clock() * 1000)}`;
    enemyModel.SetAttribute('OwnerUserId', this._player.UserId);

    // 倒す用の ProximityPrompt （なければつける）
    let prompt = enemyModel.FindFirstChildOfClass('ProximityPrompt');
    if (!prompt) {
      const pp = new Instance('ProximityPrompt');
      pp.ActionText = '攻撃する';
      pp.ObjectText = enemyModel.Name;
      pp.MaxActivationDistance = 10;

      // どのPartにつけるか、PrimaryPartを優先。
      const primary =
        enemyModel.PrimaryPart ??
        enemyModel.FindFirstChildWhichIsA('BasePart', true);
      if (!primary) {
        return false;
      }
      pp.Parent = primary;
      prompt = pp;
    }
    prompt.Triggered.Connect((p) => {
      if (p !== this._player) return;
      enemyModel.Destroy();
    });

    // 配置
    enemyModel.Parent = this._enemiesFolder;
    const cf = getSpawnCFrameInArea(area, this._randomizer, {
      paddingStuds: 2,
      yOffsetStuds: 5,
    });
    enemyModel.PivotTo(cf);

    this._aliveEnemies.add(enemyModel);

    // 倒されたらaliveから削除
    enemyModel.AncestryChanged.Connect(async (_, parent) => {
      if (parent) return;
      this._aliveEnemies.delete(enemyModel);

      const resolved = resolveSpawnConfigFromArea(area);
      if (!resolved) return;
      const { spawnConfig } = resolved;

      // 倒されたら次を生成
      await task.wait(spawnConfig.spawnIntervalSec);
    });
    return true;
  }
}

// 敵スポーン管理サービス
export class EnemySpawnService {
  private readonly _enemiesFolder = getOrCreateFolder(Workspace, 'Enemies');
  private readonly _spawners = new Map<number, PlayerSpawner>(); // userId -> spawner

  // プレイヤーのスポーン状態を更新
  public updateSpawnStateByPlayer(player: Player, placeKey: string): void {
    const spawner = this._spawners.get(player.UserId);
    if (!spawner) {
      warn(`[EnemySpawnService] spawner missing for ${player.Name}`);
      return;
    }

    const area = resolveEnemyAreaByPlaceKey(placeKey);
    print(
      `[EnemySpawnService] updateSpawnState player=${player.Name} area=${area ? area.GetFullName() : 'none'}`,
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
    if (resolved) {
      print(
        `[EnemySpawnService] Start spawning player=${player.Name} areaId=${resolved.areaId} areaLevel=${resolved.areaLevel} template=${resolved.spawnConfig.templateName}`,
      );
    } else {
      const areaId = area.GetAttribute('AreaId');
      const level = area.GetAttribute('Level');
      print(
        `[EnemySpawnService] Start spawning player=${player.Name} area=${areaId} level=${level} (config unresolved)`,
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
    if (!spawner) return;
    spawner.stop();
    this._spawners.delete(player.UserId);
  }
}

export const enemySpawnService = new EnemySpawnService();
