import { ServerStorage } from '@rbxts/services';
import { ATTRS } from 'shared/constants';
import type { AreaLevel, AreaSpawnConfig } from 'shared/types/enemy';
import { getAreaSpawnConfig } from 'shared/utils/enemies';
import { logger } from 'shared/utils/logger';
import { toAreaLevel } from 'shared/utils/type-guards';
import { getSpawnCFrameInArea } from '../utils/spawn-position';

// エリア情報からスポーン設定を解決する
function resolveSpawnConfigFromArea(area: BasePart):
  | {
      areaId: string;
      areaLevel: AreaLevel;
      spawnConfig: AreaSpawnConfig;
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

// プレイヤーごとのスポーン管理クラス
export class PlayerSpawner {
  private readonly _randomizer = new Random();
  private readonly _aliveEnemies = new Set<Model>();
  private readonly _MILLISECONDS_PER_SECOND = 1000;
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
    this._maintain();
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
  private async _maintain(): Promise<void> {
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
        const isSuccessSpawn = this.spawnOne(spawnConfig.templateName, area);
        if (!isSuccessSpawn) break;
        await task.wait(0.05);
      }

      await task.wait(spawnConfig.spawnIntervalSec);
    }
  }

  // スポーンエリアを解除
  public clearArea() {
    this._currentArea = undefined;
  }

  // 敵を全部削除、スポーン停止
  public reset(): void {
    this.stop();
    this.clearArea();
  }

  // 敵を1体スポーンさせる
  private spawnOne(templateName: string, area: BasePart): boolean {
    const spawnable = ServerStorage.FindFirstChild('Spawnables');

    if (!spawnable || !spawnable.IsA('Folder')) {
      // フォルダがない時
      logger.warn(
        'EnemySpawn',
        'ServerStorage/Spawnables フォルダーがありません',
      );
      return false;
    }

    const enemyTemplateModel = spawnable.FindFirstChild(templateName);

    if (!enemyTemplateModel || !enemyTemplateModel.IsA('Model')) {
      // テンプレートがない時
      const available = spawnable
        .GetChildren()
        .map((c) => c.Name)
        .join(', ');
      logger.warn(
        'EnemySpawn',
        `スポーンテンプレートが見つからないかModelではありません: ` +
          `requested="${templateName}" actual="${enemyTemplateModel ? enemyTemplateModel.ClassName : 'nil'}" ` +
          `available=[${available}]`,
      );
      return false;
    }

    const enemyModel = enemyTemplateModel.Clone();
    const uptimeMs = math.floor(os.clock() * this._MILLISECONDS_PER_SECOND);
    enemyModel.Name = `${enemyTemplateModel.Name}_${this._player.UserId}_${uptimeMs}`;
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
        enemyModel.Destroy();
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

      // const resolved = resolveSpawnConfigFromArea(area);
      // if (!resolved) return;
      // const { spawnConfig } = resolved;

      // // 倒されたら次を生成
      // await task.wait(spawnConfig.spawnIntervalSec);
    });
    return true;
  }
}
