import { CollectionService, RunService } from '@rbxts/services';
import { ATTRIBUTES, TAGS } from 'shared/constants';
import {
  findNearestPlayer,
  getHumanoidFromModel,
  getNumberAttribute,
  getRootPartFromModel,
  logger,
} from 'shared/utils';
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
    const humanoid = getHumanoidFromModel(model);
    const root = getRootPartFromModel(model);
    if (!humanoid || !root) {
      return;
    }

    const aggroRange = getNumberAttribute(model, ATTRIBUTES.AggroRange, 60);
    const stopDistance = getNumberAttribute(model, ATTRIBUTES.StopDistance, 4);
    const chaseSpeed = getNumberAttribute(model, ATTRIBUTES.ChaseSpeed, 14);

    const targetModel = findNearestPlayer(root.Position, aggroRange);
    if (!targetModel) {
      return;
    }

    const targetRoot = getRootPartFromModel(targetModel);
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
}

/** EnemyChaseSystemのシングルトンインスタンス */
export const enemyChaseSystem = new EnemyChaseSystem();
