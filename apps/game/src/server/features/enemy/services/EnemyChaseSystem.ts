import { CollectionService, Players, RunService } from '@rbxts/services';
import { ATTRS, TAGS } from 'shared/constants';
import { logger } from 'shared/utils/logger';
import { BaseService } from '../../../core/Service';

function getHumanoid(model: Model): Humanoid | undefined {
  return model.FindFirstChildOfClass('Humanoid');
}

function getRoot(model: Model): BasePart | undefined {
  return (
    model.PrimaryPart ??
    (model.FindFirstChild('HumanoidRootPart') as BasePart | undefined)
  );
}

function isAliveCharacter(char?: Model): char is Model {
  if (!char) return false;
  const hum = char.FindFirstChildOfClass('Humanoid');
  return hum !== undefined && hum.Health > 0;
}

function pickNearestPlayer(
  enemyPos: Vector3,
  AggroRange: number,
): Model | undefined {
  const range2 = AggroRange * AggroRange;

  let bastChar: Model | undefined;
  let bestDist2 = math.huge;

  for (const p of Players.GetPlayers()) {
    const char = p.Character;
    if (!isAliveCharacter(char)) continue;

    const hrp = char.FindFirstChild('HumanoidRootPart') as BasePart | undefined;
    if (!hrp) continue;

    const d = hrp.Position.sub(enemyPos);
    const dist2 = d.Dot(d);
    if (dist2 <= range2 && dist2 < bestDist2) {
      bestDist2 = dist2;
      bastChar = char;
    }
  }
  return bastChar;
}

export class EnemyChaseSystem extends BaseService {
  private _acc = 0;

  constructor() {
    super('EnemyChase');
  }

  start() {
    super.start();
    // 追加観測：タグ付与された瞬間
    CollectionService.GetInstanceAddedSignal(TAGS.ENEMY).Connect((inst) => {
      logger.debug(
        'EnemyChase',
        `敵にタグ付与: class=${inst.ClassName} name=${inst.GetFullName()}`,
      );
    });

    // （任意）外れた瞬間も
    CollectionService.GetInstanceRemovedSignal(TAGS.ENEMY).Connect((inst) => {
      logger.debug('EnemyChase', `敵のタグ削除: ${inst.GetFullName()}`);
    });

    const conn = RunService.Heartbeat.Connect((dt) => {
      this._acc += dt;

      if (this._acc < 0.1) return;
      this._acc = 0;

      const tagged = CollectionService.GetTagged(TAGS.ENEMY);
      for (const inst of tagged) {
        if (!inst.IsA('Model')) continue;
        this._updateEnemy(inst);
      }
    });
    return () => conn.Disconnect();
  }

  private _updateEnemy(enemy: Model) {
    const hum = getHumanoid(enemy);
    const root = getRoot(enemy);
    if (!hum || !root) return;

    const aggroRange = (enemy.GetAttribute(ATTRS.AGGRO_RANGE) as number) ?? 60;
    const stopDist = (enemy.GetAttribute(ATTRS.STOP_DISTANCE) as number) ?? 4;
    const speed = (enemy.GetAttribute(ATTRS.CHASE_SPEED) as number) ?? 14;

    const targetChar = pickNearestPlayer(root.Position, aggroRange);
    if (!targetChar) return;

    const targetRoot = targetChar.FindFirstChild('HumanoidRootPart') as
      | BasePart
      | undefined;
    if (!targetRoot) return;

    const toTarget = targetRoot.Position.sub(root.Position);
    const dist = toTarget.Magnitude;

    if (dist <= stopDist) return;

    hum.WalkSpeed = speed;
    hum.MoveTo(targetRoot.Position);
  }
}
