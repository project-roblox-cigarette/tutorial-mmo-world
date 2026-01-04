import { ServerStorage, Workspace } from '@rbxts/services';
import { getAreaSpawnConfig } from '../../shared/EnemySpawnConfig';
import { resolveEnemyAreaForPlayer } from './spawn/AreaResolver';
import { getSpawnCFrameInArea } from './spawn/SpawnPosition';

function getOrCreateFolder(parent: Instance, name: string): Folder {
  const found = parent.FindFirstChild(name);
  if (found?.IsA('Folder')) return found;
  const f = new Instance('Folder');
  f.Name = name;
  f.Parent = parent;
  return f;
}

class PlayerSpawner {
  private readonly rng = new Random();
  private readonly alive = new Set<Model>();
  private running = false;

  constructor(
    private readonly player: Player,
    private readonly enemiesFolder: Folder,
    private currentArea?: BasePart,
  ) {}

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.maintain();
  }

  public stop(): void {
    this.running = false;
    for (const m of this.alive) m.Destroy();
    this.alive.clear();
  }

  public setArea(area: BasePart) {
    this.currentArea = area;
  }

  public getArea(): BasePart | undefined {
    return this.currentArea;
  }

  public isRunningIn(area: BasePart): boolean {
    return this.running && this.currentArea === area;
  }

  private async maintain(): Promise<void> {
    while (this.running) {
      const area = this.currentArea;
      if (!area) {
        await task.wait(0.3);
        continue;
      }

      const areaId = area.GetAttribute('AreaId');
      const level = area.GetAttribute('Level');
      if (typeOf(areaId) !== 'string' || typeOf(level) !== 'number') {
        await task.wait(1);
        continue;
      }

      const cfg = getAreaSpawnConfig(areaId as string, level as number);
      if (!cfg) {
        await task.wait(1);
        continue;
      }

      while (this.running && this.alive.size() < cfg.maxAlivePerPlayer) {
        const ok = this.spawnOne(cfg.templateName, area);
        if (!ok) break;
        await task.wait(0.05);
      }

      await task.wait(cfg.spawnIntervalSec);
    }
  }

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

    const model = template.Clone();
    model.Name = `${template.Name}_${this.player.UserId}_${math.floor(os.clock() * 1000)}`;
    model.SetAttribute('OwnerUserId', this.player.UserId);

    // 倒す用の ProximityPrompt （なければつける）
    let prompt = model.FindFirstChildOfClass('ProximityPrompt');
    if (!prompt) {
      const pp = new Instance('ProximityPrompt');
      pp.ActionText = '攻撃する';
      pp.ObjectText = model.Name;
      pp.MaxActivationDistance = 10;

      // どのPartにつけるか、PrimaryPartを優先。
      const primary =
        model.PrimaryPart ?? model.FindFirstChildWhichIsA('BasePart', true);
      if (!primary) {
        return false;
      }
      pp.Parent = primary;
      prompt = pp;
    }
    prompt.Triggered.Connect((p) => {
      if (p !== this.player) return;
      model.Destroy();
    });

    // 配置
    model.Parent = this.enemiesFolder;
    const cf = getSpawnCFrameInArea(area, this.rng, {
      paddingStuds: 2,
      yOffsetStuds: 5,
    });
    model.PivotTo(cf);

    this.alive.add(model);

    // 倒されたらaliveから削除
    model.AncestryChanged.Connect(async (_, parent) => {
      if (parent) return;
      this.alive.delete(model);

      const areaId = area.GetAttribute('AreaId');
      const level = area.GetAttribute('Level');
      if (typeOf(areaId) !== 'string' || typeOf(level) !== 'number') return;

      const cfg = getAreaSpawnConfig(areaId as string, level as number);
      if (!cfg) return;

      // 倒されたら次を生成
      await task.wait(cfg.spawnIntervalSec);
    });
    return true;
  }
}

export class EnemySpawnService {
  private readonly enemiesFolder = getOrCreateFolder(Workspace, 'Enemies');
  private readonly spawners = new Map<number, PlayerSpawner>(); // userId -> spawner

  public updateSpawnState(player: Player): void {
    const spawner = this.spawners.get(player.UserId);
    if (!spawner) {
      warn(`[EnemySpawnService] spawner missing for ${player.Name}`);
      return;
    }

    const area = resolveEnemyAreaForPlayer(player);
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

    const areaId = area.GetAttribute('AreaId');
    const level = area.GetAttribute('Level');
    print(
      `[EnemySpawnService] Start spawning for Player ${player.Name} in Area ${areaId} Level ${level}`,
    );
  }

  public onPlayerAdded(player: Player): void {
    const spawner = new PlayerSpawner(player, this.enemiesFolder);
    this.spawners.set(player.UserId, spawner);
  }

  public onPlayerRemoving(player: Player): void {
    const spawner = this.spawners.get(player.UserId);
    if (!spawner) return;
    spawner.stop();
    this.spawners.delete(player.UserId);
  }
}

export const enemySpawnService = new EnemySpawnService();
