import { ServerStorage } from '@rbxts/services';
import { ATTRIBUTES, ENEMY_BALANCE_BY_LEVEL } from 'shared/constants';
import type { AreaId, AreaLevel, AreaSpawnConfig } from 'shared/types/enemy';
import { getAreaSpawnConfig } from 'shared/utils/enemies';
import { logger } from 'shared/utils/logger';
import { toAreaLevel } from 'shared/utils/type-guards';
import { finalizeEnemyDeath } from '../../combat/utils/damage';
import { getSpawnCFrameInArea } from '../utils/spawn-position';

// エリア情報からスポーン設定を解決する
function resolveSpawnConfigFromArea(area: BasePart):
  | {
      areaId: AreaId;
      areaLevel: AreaLevel;
      spawnConfig: AreaSpawnConfig;
    }
  | undefined {
  const areaIdAttr = area.GetAttribute(ATTRIBUTES.AreaId);
  const areaLevelAttr = area.GetAttribute(ATTRIBUTES.AreaLevel);

  if (!typeIs(areaIdAttr, 'string')) {
    return undefined;
  }
  if (!typeIs(areaLevelAttr, 'number')) {
    return undefined;
  }

  const areaLevel = toAreaLevel(areaLevelAttr);
  if (!areaLevel) {
    return undefined;
  }

  const spawnConfig = getAreaSpawnConfig(areaIdAttr, areaLevel);
  if (!spawnConfig) {
    return undefined;
  }

  return {
    areaId: areaIdAttr,
    areaLevel,
    spawnConfig,
  };
}

// プレイヤーごとのスポーン管理クラス
export class PlayerSpawner {
  private readonly _randomizer = new Random();
  private readonly _aliveEnemies = new Set<Model>();
  private readonly _MILLISECONDS_PER_SECOND = 1000;
  private _isRunning = false;

  constructor(
    private readonly _player: Player,
    private readonly _enemiesFolder: Folder,
    private _currentArea?: BasePart,
  ) {}

  // スポーン開始
  public start(): void {
    if (this._isRunning) {
      return;
    }

    this._isRunning = true;
    this._maintain();
  }

  // スポーン停止
  public stop(): void {
    this._isRunning = false;

    // 全敵を削除（Model内のScriptが自動的にクリーンアップ）
    for (const model of this._aliveEnemies) {
      model.Destroy();
    }

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

  // スポーンエリアを解除
  public clearArea() {
    this._currentArea = undefined;
  }

  // 敵を全部削除、スポーン停止
  public reset(): void {
    this.stop();
    this.clearArea();
  }

  // 指定エリアでスポーン中か
  public isRunningIn(area: BasePart): boolean {
    return this._isRunning && this._currentArea === area;
  }

  // 敵ModelにAIスクリプトを配置
  private _attachEnemyAI(enemyModel: Model): void {
    // ServerStorage/CharacterScripts/enemy/EnemyChaseAI を取得
    const characterScripts = ServerStorage.FindFirstChild('CharacterScripts');
    if (!characterScripts || !characterScripts.IsA('Folder')) {
      logger.warn(
        'EnemySpawn',
        'ServerStorage/CharacterScripts フォルダーがありません',
      );
      return;
    }

    const enemyFolder = characterScripts.FindFirstChild('enemy');
    if (!enemyFolder || !enemyFolder.IsA('Folder')) {
      logger.warn(
        'EnemySpawn',
        'ServerStorage/CharacterScripts/enemy フォルダーがありません',
      );
      return;
    }

    const enemyAIScript = enemyFolder.FindFirstChild('EnemyChaseAI');
    if (!enemyAIScript || !enemyAIScript.IsA('Script')) {
      logger.warn(
        'EnemySpawn',
        'ServerStorage/CharacterScripts/enemy/EnemyChaseAI スクリプトがありません',
      );
      return;
    }

    // スクリプトをクローンして敵Model内に配置
    const clonedScript = enemyAIScript.Clone();
    clonedScript.Parent = enemyModel;

    logger.debug(
      'EnemySpawn',
      `EnemyChaseAIスクリプトを配置: ${enemyModel.Name}`,
    );
  }

  // 倒されたら次をスポーンさせる維持処理
  private async _maintain(): Promise<void> {
    while (this._isRunning) {
      const area = this._currentArea;
      if (!area) {
        task.wait(0.3);
        continue;
      }

      const getResolved = resolveSpawnConfigFromArea(area);
      if (!getResolved) {
        task.wait(1);
        continue;
      }
      const { spawnConfig, areaLevel } = getResolved;

      while (
        this._isRunning &&
        this._aliveEnemies.size() < spawnConfig.MaxAlivePerPlayer
      ) {
        const isSuccessSpawn = this.spawnOne(
          spawnConfig.TemplateName,
          area,
          areaLevel,
        );
        if (!isSuccessSpawn) break;

        task.wait(0.05);
      }

      task.wait(spawnConfig.SpawnIntervalSec);
    }
  }

  // 敵を1体スポーンさせる
  private spawnOne(
    templateName: string,
    area: BasePart,
    enemyLevel: AreaLevel,
  ): boolean {
    const spawnable = ServerStorage.FindFirstChild('Spawnables');

    if (!spawnable || !spawnable.IsA('Folder')) {
      // フォルダがない時
      logger.warn(
        'EnemySpawn',
        'ServerStorage/Spawnables フォルダーがありません',
      );
      return false;
    }

    const getEnemyTemplateModel = spawnable.FindFirstChild(templateName);
    if (!getEnemyTemplateModel || !getEnemyTemplateModel.IsA('Model')) {
      // テンプレートがない時
      const available = spawnable
        .GetChildren()
        .map((c) => c.Name)
        .join(', ');
      logger.warn(
        'EnemySpawn',
        `スポーンテンプレートが見つからないかModelではありません: ` +
          `requested="${templateName}" actual="${getEnemyTemplateModel ? getEnemyTemplateModel.ClassName : 'nil'}" ` +
          `available=[${available}]`,
      );
      return false;
    }

    const clonedEnemyModel = getEnemyTemplateModel.Clone();
    const uptimeMs = math.floor(os.clock() * this._MILLISECONDS_PER_SECOND);
    clonedEnemyModel.Name = `${getEnemyTemplateModel.Name}_${this._player.UserId}_${uptimeMs}`;

    const enemyHealthFromBalance = ENEMY_BALANCE_BY_LEVEL[enemyLevel].Hp;

    // Attribute付与
    clonedEnemyModel.SetAttribute(ATTRIBUTES.OwnerUserId, this._player.UserId);
    clonedEnemyModel.SetAttribute(ATTRIBUTES.EnemyLevel, enemyLevel);
    clonedEnemyModel.SetAttribute(ATTRIBUTES.Hp, enemyHealthFromBalance);

    // 実耐久はHumanoidをSSOTとして初期化
    const humanoid = clonedEnemyModel.FindFirstChildWhichIsA('Humanoid', true);
    if (humanoid?.IsA('Humanoid')) {
      humanoid.MaxHealth = enemyHealthFromBalance;
      humanoid.Health = enemyHealthFromBalance;
    }

    // ProximityPromptの配置
    let getProximityPrompt =
      clonedEnemyModel.FindFirstChildOfClass('ProximityPrompt');
    if (!getProximityPrompt) {
      const newProximityPrompt = new Instance('ProximityPrompt');
      newProximityPrompt.ActionText = '攻撃する';
      newProximityPrompt.ObjectText = clonedEnemyModel.Name;
      newProximityPrompt.MaxActivationDistance = 10;

      // どのPartにつけるか、PrimaryPartを優先。
      const getPrimaryPart =
        clonedEnemyModel.PrimaryPart ??
        clonedEnemyModel.FindFirstChildWhichIsA('BasePart', true);
      if (getPrimaryPart) {
        newProximityPrompt.Parent = getPrimaryPart;
      }

      getProximityPrompt = newProximityPrompt;
    }

    // Destroyを直呼びせず、finalizeEnemyDeathを経由
    getProximityPrompt.Triggered.Connect((triggeredPlayer) => {
      if (triggeredPlayer !== this._player) {
        return;
      }
      finalizeEnemyDeath(clonedEnemyModel, triggeredPlayer);
    });

    // スポーン位置を決めて配置
    clonedEnemyModel.Parent = this._enemiesFolder;
    const spawnCFrame = getSpawnCFrameInArea(area, this._randomizer, {
      PaddingStuds: 2,
      YOffsetStuds: 5,
    });
    clonedEnemyModel.PivotTo(spawnCFrame);

    // EnemyAIスクリプトを配置（Model設定完了後に配置して自動実行）
    this._attachEnemyAI(clonedEnemyModel);

    this._aliveEnemies.add(clonedEnemyModel);

    // 倒されたらaliveから削除
    clonedEnemyModel.AncestryChanged.Connect(async (_, parent) => {
      if (parent) {
        return;
      }

      // Model内のスクリプトが自動的にクリーンアップされる
      this._aliveEnemies.delete(clonedEnemyModel);

      // const resolved = resolveSpawnConfigFromArea(area);
      // if (!resolved) return;
      // const { spawnConfig } = resolved;

      // // 倒されたら次を生成
      // task.wait(spawnConfig.spawnIntervalSec);
    });
    return true;
  }
}
