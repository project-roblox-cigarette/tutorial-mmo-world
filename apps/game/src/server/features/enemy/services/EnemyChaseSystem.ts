import { CollectionService, Players, RunService } from '@rbxts/services';
import { ATTRIBUTES, TAGS } from 'shared/constants';
import { logger } from 'shared/utils/logger';
import { BaseService } from '../../../core/Service';

export class EnemyChaseSystem extends BaseService {
  private _accumulatedTime = 0;

  constructor() {
    super('EnemyChase');
  }

  public start() {
    super.start();

    // 追加観測：タグ付与された瞬間
    CollectionService.GetInstanceAddedSignal(TAGS.ENEMY).Connect((model) => {
      logger.debug(
        'EnemyChase',
        `敵にタグ付与: class=${model.ClassName} name=${model.GetFullName()}`,
      );
    });

    // （任意）外れた瞬間も
    CollectionService.GetInstanceRemovedSignal(TAGS.ENEMY).Connect((model) => {
      logger.debug('EnemyChase', `敵のタグ削除: ${model.GetFullName()}`);
    });

    const heartbeatConnection = RunService.Heartbeat.Connect((deltaTime) => {
      this._accumulatedTime += deltaTime;
      if (this._accumulatedTime < 0.1) {
        return;
      }
      this._accumulatedTime = 0;

      for (const model of CollectionService.GetTagged(TAGS.ENEMY)) {
        if (!model.IsA('Model')) continue;

        this._updateEnemyByModel(model);
      }
    });

    return () => {
      heartbeatConnection.Disconnect();
    };
  }

  private _updateEnemyByModel(model: Model) {
    const humanoid = this._getHumanoidByModel(model);
    const root = this._getRootByModel(model);
    if (!humanoid || !root) {
      return;
    }

    const aggroRange =
      (model.GetAttribute(ATTRIBUTES.AggroRange) as number) ?? 60;
    const stopDistance =
      (model.GetAttribute(ATTRIBUTES.StopDistance) as number) ?? 4;
    const chaseSpeed =
      (model.GetAttribute(ATTRIBUTES.ChaseSpeed) as number) ?? 14;

    const targetModel = this._pickNearestPlayerByPosition(
      root.Position,
      aggroRange,
    );
    if (!targetModel) {
      return;
    }

    const targetRoot = this._getRootByModel(targetModel);
    if (!targetRoot) {
      return;
    }

    const toTarget = targetRoot.Position.sub(root.Position);
    const dist = toTarget.Magnitude;

    if (dist <= stopDistance) {
      return;
    }

    humanoid.WalkSpeed = chaseSpeed;
    humanoid.MoveTo(targetRoot.Position);
  }

  private _getHumanoidByModel(model: Model): Humanoid | undefined {
    return model.FindFirstChildOfClass('Humanoid');
  }

  private _getRootByModel(model: Model): BasePart | undefined {
    return (
      model.PrimaryPart ??
      (model.FindFirstChild('HumanoidRootPart') as BasePart | undefined)
    );
  }

  private _isAliveCharacterByModel(model?: Model): model is Model {
    if (!model) {
      return false;
    }

    const getHumanoid = this._getHumanoidByModel(model);
    return getHumanoid !== undefined && getHumanoid.Health > 0;
  }

  private _pickNearestPlayerByPosition(
    enemyPos: Vector3,
    AggroRange: number,
  ): Model | undefined {
    const range2 = AggroRange * AggroRange;

    let bestChar: Model | undefined;
    let bestDist2 = math.huge;

    for (const player of Players.GetPlayers()) {
      const model = player.Character;
      if (!this._isAliveCharacterByModel(model)) {
        continue;
      }

      const root = this._getRootByModel(model);
      if (!root) {
        continue;
      }

      const dVector = root.Position.sub(enemyPos);
      const dist2 = dVector.Dot(dVector);
      if (dist2 <= range2 && dist2 < bestDist2) {
        bestDist2 = dist2;
        bestChar = model;
      }
    }
    return bestChar;
  }
}
