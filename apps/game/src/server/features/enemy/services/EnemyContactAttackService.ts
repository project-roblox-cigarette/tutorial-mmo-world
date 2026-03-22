import { CollectionService, Players } from '@rbxts/services';
import { ATTRIBUTES, ENEMY_BALANCE_BY_LEVEL, TAGS } from 'shared/constants';
import { Result } from 'shared/types/result';
import { getRootPartFromModel, logger } from 'shared/utils';
import { applyDamageToModel } from 'shared/utils/health';
import { BaseService } from '../../../core/Service';

function resolveEnemyLevel(enemy: Model): 1 | 2 | 3 {
  const enemyLevelAttribute = enemy.GetAttribute(ATTRIBUTES.EnemyLevel);

  if (
    typeIs(enemyLevelAttribute, 'number') &&
    (enemyLevelAttribute === 1 ||
      enemyLevelAttribute === 2 ||
      enemyLevelAttribute === 3)
  ) {
    return enemyLevelAttribute;
  }

  return 1;
}

export class EnemyContactAttackService extends BaseService {
  /** 敵モデル -> 接触監視の接続 */
  private readonly _connections = new Map<Model, RBXScriptConnection>();

  /** プレイヤーごとの連続ヒット防止（秒） */
  private readonly _hitCooldownSeconds = 1.0;
  private readonly _lastHitAtTimes = new Map<number, number>();

  constructor() {
    super('EnemyContactAttack');
  }

  public start() {
    super.start();

    for (const inst of CollectionService.GetTagged(TAGS.ENEMY)) {
      if (inst.IsA('Model')) {
        this._bind(inst);
      }
    }

    CollectionService.GetInstanceAddedSignal(TAGS.ENEMY).Connect((inst) => {
      if (inst.IsA('Model')) {
        this._bind(inst);
      }
    });

    CollectionService.GetInstanceRemovedSignal(TAGS.ENEMY).Connect((inst) => {
      if (inst.IsA('Model')) {
        this._unbind(inst);
      }
    });
  }

  private _bind(enemy: Model): void {
    if (this._connections.has(enemy)) {
      return;
    }

    const root = getRootPartFromModel(enemy);
    if (!root) {
      logger.warn(
        'EnemyContactAttack',
        `バインドをスキップ: root (PrimaryPart/HumanoidRootPart) がありません enemy=${enemy.GetFullName()}`,
      );
      return;
    }

    root.CanTouch = true;

    const connection = root.Touched.Connect((hit) => {
      this._onTouched(enemy, hit);
    });

    this._connections.set(enemy, connection);

    enemy.AncestryChanged.Connect((_, parent) => {
      if (parent) return;
      this._unbind(enemy);
    });
  }

  private _unbind(enemy: Model): void {
    const connection = this._connections.get(enemy);
    if (connection) {
      connection.Disconnect();
    }

    this._connections.delete(enemy);
  }

  private _onTouched(enemy: Model, hit: BasePart): void {
    const character = hit.FindFirstAncestorOfClass('Model');
    if (!character) return;
    if (!enemy.Parent) return;

    const player = Players.GetPlayerFromCharacter(character);
    if (!player) return;

    const nowTime = os.clock();
    const lastHitAtTime = this._lastHitAtTimes.get(player.UserId);
    if (
      lastHitAtTime !== undefined &&
      nowTime - lastHitAtTime < this._hitCooldownSeconds
    ) {
      return;
    }
    this._lastHitAtTimes.set(player.UserId, nowTime);

    const enemyLevel = resolveEnemyLevel(enemy);
    const damage = ENEMY_BALANCE_BY_LEVEL[enemyLevel].EnemyDamage;

    const result = applyDamageToModel(character, damage);

    if (Result.isSuccess(result)) {
      logger.debug(
        'EnemyContactAttack',
        `接触ダメージ: player=${player.Name} enemy=${enemy.Name} damage=${damage} killed=${tostring(result.Value.Killed)}`,
      );
    } else {
      logger.debug(
        'EnemyContactAttack',
        `接触ダメージ失敗: player=${player.Name} enemy=${enemy.Name} reason=${result.Error}`,
      );
    }
  }
}

/** EnemyContactAttackServiceのシングルトンインスタンス */
export const enemyContactAttackService = new EnemyContactAttackService();
