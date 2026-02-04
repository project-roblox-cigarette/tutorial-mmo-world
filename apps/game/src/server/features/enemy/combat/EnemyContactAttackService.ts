import {
  CollectionService,
  Players,
  RunService,
  TeleportService,
} from '@rbxts/services';
import { TAG_ENEMY } from '../../../../shared/constants';
import { getPlaceId, type PlaceKey } from '../../../../shared/Places';
import { enemySpawnService } from '../EnemySpawnService';

export class EnemyContactAttackService {
  /** 敵モデル -> 接触監視の接続 */
  private readonly conns = new Map<Model, RBXScriptConnection>();

  /** プレイヤーごとの連続ヒット防止（秒） */
  private readonly hitCooldownSec = 1.0;
  private readonly lastHitAt = new Map<number, number>();

  /** テレポート二重発火防止 */
  private readonly teleporting = new Set<number>();

  /** ロビーのPlaceKey */
  private readonly lobbyKey: PlaceKey = 'Lobby' as PlaceKey;

  public start(): void {
    // 既存のEnemyにもバインド
    for (const inst of CollectionService.GetTagged(TAG_ENEMY)) {
      if (inst.IsA('Model')) this.bind(inst);
    }

    // 追加されたEnemyにバインド
    CollectionService.GetInstanceAddedSignal(TAG_ENEMY).Connect((inst) => {
      if (inst.IsA('Model')) this.bind(inst);
    });

    // 削除されたEnemyのバインド解除
    CollectionService.GetInstanceRemovedSignal(TAG_ENEMY).Connect((inst) => {
      if (inst.IsA('Model')) this.unbind(inst);
    });
  }

  // バインド処理
  private bind(enemy: Model): void {
    if (this.conns.has(enemy)) return; // 既にバインド済み

    const root =
      enemy.PrimaryPart ??
      (enemy.FindFirstChild('HumanoidRootPart') as BasePart | undefined);
    if (!root) {
      warn(
        `[EnemyContactAttack] skip: no root (PrimaryPart/HumanoidRootPart) enemy=${enemy.GetFullName()}`,
      );
      return;
    }

    root.CanTouch = true;

    const conn = root.Touched.Connect((hit) => {
      this.onTouched(enemy, hit);
    });
    this.conns.set(enemy, conn);

    // 破棄されたら解除
    enemy.AncestryChanged.Connect((_, parent) => {
      if (parent) return;
      this.unbind(enemy);
    });
  }

  // バインド解除
  private unbind(enemy: Model): void {
    const conn = this.conns.get(enemy);
    if (conn) conn.Disconnect();
    this.conns.delete(enemy);
  }

  // 敵が何かに触れたときの処理
  private onTouched(enemy: Model, hit: BasePart): void {
    // ヒットしたPartがCharacterがどうか。
    const char = hit.FindFirstAncestorOfClass('Model');
    if (!char) return;

    const player = Players.GetPlayerFromCharacter(char);
    if (!player) return;

    if (!enemy.Parent) return; // 敵である前提を確認

    // 連続ヒット防止
    const now = os.clock();
    const last = this.lastHitAt.get(player.UserId);
    if (last !== undefined && now - last < this.hitCooldownSec) return;
    this.lastHitAt.set(player.UserId, now);

    // テレポート中は無効化
    if (this.teleporting.has(player.UserId)) return;

    const root =
      enemy.PrimaryPart ??
      (enemy.FindFirstChild('HumanoidRootPart') as BasePart | undefined);
    if (root) root.CanTouch = false;

    this.teleporting.add(player.UserId);

    // ロビーにテレポート
    this.returntoLobby(player);
  }

  // ロビーにテレポートする処理
  private returntoLobby(player: Player): void {
    if (RunService.IsStudio()) {
      player.CharacterAdded.Once(() => {
        enemySpawnService.despawnAllForPlayer(player);
      });

      const char = player.Character;
      const hum = char?.FindFirstChildOfClass('Humanoid');
      if (hum) hum.Health = 0;

      this.teleporting.delete(player.UserId);
      return;
    }
    const placeId = getPlaceId(this.lobbyKey);

    const [ok, err] = pcall(() => {
      TeleportService.Teleport(placeId, player);
    });

    if (!ok) {
      warn(
        `[EnemyContactAttack] teleport failed player=${player.Name} err=${tostring(err)}`,
      );
      this.teleporting.delete(player.UserId);
      return;
    }

    task.delay(3, () => this.teleporting.delete(player.UserId));
  }
}
