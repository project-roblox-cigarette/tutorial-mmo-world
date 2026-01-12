import { Workspace } from '@rbxts/services';
import {
  getAreaSpawnConfig,
  toAreaLevel,
  type AreaSpawnConfig,
  type AreaLevel,
} from '../../../shared/config/EnemySpawnConfig';
import { createEnemyFromTemplateName } from './spawn/EnemyFactory';
import { resolveEnemyAreaByPlaceKey } from './spawn/AreaResolver';
import { getSpawnCFrameInArea } from './spawn/SpawnPosition';
import {
  ATTR_CHASE_SPEED,
  ATTR_AGGRO_RANGE,
  ATTR_STOP_DISTANCE,
  ATTR_CHASE_TICK,
} from '../../../shared/constants';

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
      level: AreaLevel;
      config: AreaSpawnConfig;
    }
  | undefined {
  const areaIdAttr = area.GetAttribute('AreaId');
  const levelAttr = area.GetAttribute('Level');

  if (!typeIs(areaIdAttr, 'string')) return undefined;
  if (!typeIs(levelAttr, 'number')) return undefined;

  const lv = toAreaLevel(levelAttr);
  if (!lv) return undefined;

  const cfg = getAreaSpawnConfig(areaIdAttr, lv);
  if (!cfg) return undefined;

  return { areaId: areaIdAttr, level: lv, config: cfg };
}

// プレイヤーごとのスポーン管理クラス
class PlayerSpawner {
  private readonly rng = new Random();
  private readonly alive = new Set<Model>();
  private running = false;

  constructor(
    private readonly player: Player,
    private readonly enemiesFolder: Folder,
    private currentArea?: BasePart,
  ) {}

  // スポーン開始
  public start(): void {
    if (this.running) return;
    this.running = true;
    this.maintain();
  }

  // スポーン停止
  public stop(): void {
    this.running = false;
    for (const m of this.alive) m.Destroy();
    this.alive.clear();
  }

  // スポーンエリアを設定
  public setArea(area: BasePart) {
    this.currentArea = area;
  }

  // 現在のスポーンエリアを取得
  public getArea(): BasePart | undefined {
    return this.currentArea;
  }

  // 指定エリアでスポーン中か
  public isRunningIn(area: BasePart): boolean {
    return this.running && this.currentArea === area;
  }

  // 倒されたら次をスポーンさせる維持処理
  private async maintain(): Promise<void> {
    while (this.running) {
      const area = this.currentArea;
      if (!area) {
        await task.wait(0.3);
        continue;
      }

      const resolved = resolveSpawnConfigFromArea(area);
      if (!resolved) {
        await task.wait(1);
        continue;
      }
      const { config: cfg } = resolved;

      while (this.running && this.alive.size() < cfg.maxAlivePerPlayer) {
        const ok = this.spawnOne(cfg, area);
        if (!ok) break;
        await task.wait(0.05);
      }

      await task.wait(cfg.spawnIntervalSec);
    }
  }

  // スポーンエリアを解除
  public clearArea() {
    this.currentArea = undefined;
  }

  // 敵を全部削除、スポーン停止
  public reset(): void {
    this.stop();
    this.clearArea();
  }

  // 敵を1体スポーンさせる
  private spawnOne(cfg: AreaSpawnConfig, area: BasePart): boolean {
    const model = createEnemyFromTemplateName(cfg.templateName);
    model.Name = `${cfg.templateName}_${this.player.UserId}_${math.floor(os.clock() * 1000)}`;
    model.SetAttribute('OwnerUserId', this.player.UserId);

    // ✅ 先にWorkspace配下へ（Humanoid稼働・後続のGetFullName等が安定）
    model.Parent = this.enemiesFolder;

    print(
      `[EnemySpawnService][DBG] spawned: model=${model.GetFullName()} parent=${model.Parent ? model.Parent.GetFullName() : 'nil'}`,
    );

    const chase = cfg.chase;
    if (chase) {
      model.SetAttribute(ATTR_CHASE_SPEED, chase.speed);
      model.SetAttribute(ATTR_AGGRO_RANGE, chase.aggroRange);
      model.SetAttribute(ATTR_STOP_DISTANCE, chase.stopDistance);
      model.SetAttribute(ATTR_CHASE_TICK, chase.chaseTickSec);
    }

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
        model.Destroy(); // ✅ 追加：失敗したら片付ける
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

      const resolved = resolveSpawnConfigFromArea(area);
      if (!resolved) return;
      const { config: cfg } = resolved;

      // 倒されたら次を生成
      await task.wait(cfg.spawnIntervalSec);
    });
    return true;
  }
}

// 敵スポーン管理サービス
export class EnemySpawnService {
  private readonly enemiesFolder = getOrCreateFolder(Workspace, 'Enemies');
  private readonly spawners = new Map<number, PlayerSpawner>(); // userId -> spawner

  // プレイヤーのスポーン状態を更新
  public updateSpawnStateByPlayer(player: Player, placeKey: string): void {
    const spawner = this.spawners.get(player.UserId);
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
        `[EnemySpawnService] Start spawning player=${player.Name} areaId=${resolved.areaId} level=${resolved.level} template=${resolved.config.templateName}`,
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
    const spawner = new PlayerSpawner(player, this.enemiesFolder);
    this.spawners.set(player.UserId, spawner);
  }

  // プレイヤーが離脱したときの処理
  public onPlayerRemoving(player: Player): void {
    const spawner = this.spawners.get(player.UserId);
    if (spawner) spawner.stop();

    // 本番環境用の敵削除処理
    for (const child of this.enemiesFolder.GetChildren()) {
      if (!child.IsA('Model')) continue;
      const owner = child.GetAttribute('OwnerUserId');
      if (typeIs(owner, 'number') && owner === player.UserId) {
        child.Destroy();
      }
    }

    // spawnerを削除
    this.spawners.delete(player.UserId);
  }

  // プレイヤーの敵を全部削除、スポーン停止
  public despawnAllForPlayer(player: Player): void {
    const spawner = this.spawners.get(player.UserId);
    if (spawner) spawner.reset();
  }
}

export const enemySpawnService = new EnemySpawnService();
