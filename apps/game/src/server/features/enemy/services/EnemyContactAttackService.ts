import {
  CollectionService,
  Players,
  RunService,
  TeleportService,
} from '@rbxts/services';
import { TAGS } from 'shared/constants';
import type { PlaceKey } from 'shared/types/teleport';
import { logger } from 'shared/utils/logger';
import { getPlaceId } from 'shared/utils/places';
import { BaseService } from '../../../core/Service';
import { enemySpawnService } from './EnemySpawnService';

export class EnemyContactAttackService extends BaseService {
  /** 敵モデル -> 接触監視の接続 */
  private readonly _conns = new Map<Model, RBXScriptConnection>();

  /** プレイヤーごとの連続ヒット防止（秒） */
  private readonly _hitCooldownSec = 1.0;
  private readonly _lastHitAt = new Map<number, number>();

  /** テレポート二重発火防止 */
  private readonly _teleporting = new Set<number>();

  /** ロビーのPlaceKey */
  private readonly _lobbyKey: PlaceKey = 'Lobby' as PlaceKey;

  constructor() {
    super('EnemyContactAttack');
  }

  public start(): void {
    super.start();
    // 既存のEnemyにもバインド
    for (const inst of CollectionService.GetTagged(TAGS.ENEMY)) {
      if (inst.IsA('Model')) this._bind(inst);
    }

    // 追加されたEnemyにバインド
    CollectionService.GetInstanceAddedSignal(TAGS.ENEMY).Connect((inst) => {
      if (inst.IsA('Model')) this._bind(inst);
    });

    // 削除されたEnemyのバインド解除
    CollectionService.GetInstanceRemovedSignal(TAGS.ENEMY).Connect((inst) => {
      if (inst.IsA('Model')) this._unbind(inst);
    });
  }

  // バインド処理
  private _bind(enemy: Model): void {
    if (this._conns.has(enemy)) return; // 既にバインド済み

    const root =
      enemy.PrimaryPart ??
      (enemy.FindFirstChild('HumanoidRootPart') as BasePart | undefined);
    if (!root) {
      logger.warn(
        'EnemyContactAttack',
        `バインドをスキップ: root (PrimaryPart/HumanoidRootPart) がありません enemy=${enemy.GetFullName()}`,
      );
      return;
    }

    root.CanTouch = true;

    const conn = root.Touched.Connect((hit) => {
      this._onTouched(enemy, hit);
    });
    this._conns.set(enemy, conn);

    // 破棄されたら解除
    enemy.AncestryChanged.Connect((_, parent) => {
      if (parent) return;
      this._unbind(enemy);
    });
  }

  // バインド解除
  private _unbind(enemy: Model): void {
    const conn = this._conns.get(enemy);
    if (conn) conn.Disconnect();
    this._conns.delete(enemy);
  }

  // 敵が何かに触れたときの処理
  private _onTouched(enemy: Model, hit: BasePart): void {
    // ヒットしたPartがCharacterがどうか。
    const char = hit.FindFirstAncestorOfClass('Model');
    if (!char) return;

    const player = Players.GetPlayerFromCharacter(char);
    if (!player) return;

    if (!enemy.Parent) return; // 敵である前提を確認

    // 連続ヒット防止
    const now = os.clock();
    const last = this._lastHitAt.get(player.UserId);
    if (last !== undefined && now - last < this._hitCooldownSec) return;
    this._lastHitAt.set(player.UserId, now);

    // テレポート中は無効化
    if (this._teleporting.has(player.UserId)) return;

    const root =
      enemy.PrimaryPart ??
      (enemy.FindFirstChild('HumanoidRootPart') as BasePart | undefined);
    if (root) root.CanTouch = false;

    this._teleporting.add(player.UserId);

    // ロビーにテレポート
    this._returntoLobby(player);
  }

  // ロビーにテレポートする処理
  private _returntoLobby(player: Player): void {
    if (RunService.IsStudio()) {
      player.CharacterAdded.Once(() => {
        enemySpawnService.despawnAllForPlayer(player);
      });

      const char = player.Character;
      const hum = char?.FindFirstChildOfClass('Humanoid');
      if (hum) hum.Health = 0;

      this._teleporting.delete(player.UserId);
      return;
    }
    const placeId = getPlaceId(this._lobbyKey);

    const [ok, err] = pcall(() => {
      TeleportService.Teleport(placeId, player);
    });

    if (!ok) {
      logger.error(
        'EnemyContactAttack',
        `テレポート失敗: player=${player.Name} error=${tostring(err)}`,
      );
      this._teleporting.delete(player.UserId);
      return;
    }

    task.delay(3, () => this._teleporting.delete(player.UserId));
  }
}
