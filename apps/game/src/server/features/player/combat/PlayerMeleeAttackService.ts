import { ReplicatedStorage } from '@rbxts/services';
import { Result } from 'shared/types/result';
import type { WeaponConfig } from 'shared/types/weapon';
import { logger } from 'shared/utils/logger';
import { tryGetWeaponIdFromTool } from 'shared/utils/weapons';
import { REMOTES, WEAPON_CATALOG } from '../../../../shared/constants';
import { BaseService } from '../../../core/Service';
import {
  applyDamageToEnemy,
  finalizeEnemyDeath,
} from '../../combat/DamageUtils';
import { detectSwordEnemiesByBox } from '../../combat/MeleeHitDetectionUtils';

export class PlayerMeleeAttackService extends BaseService {
  // サーバ側クールダウン管理
  private readonly _lastAttackAt = new Map<number, number>();

  /**
   * 攻撃ウィンドウ制御用トークン
   * - 同一プレイヤーが次の攻撃を開始したらトークンを更新し、古い判定ループを停止させる
   */
  private readonly _swingToken = new Map<number, number>();

  constructor() {
    super('PlayerMeleeAttack');
  }

  /**
   * サーバ起動時に RemoteEvent を用意し、攻撃リクエストを受け付ける
   */
  public start(): void {
    super.start();
    const remote = this._getOrCreateMeleeAttackRemote();

    // Remote は誰でも叩ける前提なので、サーバ側で必ず検証して処理する
    remote.OnServerEvent.Connect((player) => {
      logger.debug('PlayerMeleeAttack', `${player.Name} から攻撃リクエスト`);
      this._onMeleeAttack(player);
    });
  }

  /**
   * RemoteEvent を ReplicatedStorage 内に作成/取得する
   * - 既存があれば再利用
   * - フォルダが無ければ作成
   */
  private _getOrCreateMeleeAttackRemote(): RemoteEvent {
    let folder = ReplicatedStorage.FindFirstChild(REMOTES.FOLDER_NAME);
    if (!folder) {
      folder = new Instance('Folder');
      folder.Name = REMOTES.FOLDER_NAME;
      folder.Parent = ReplicatedStorage;
    }

    const existing = folder.FindFirstChild(REMOTES.MELEE_ATTACK);
    if (existing?.IsA('RemoteEvent')) return existing;

    const re = new Instance('RemoteEvent');
    re.Name = REMOTES.MELEE_ATTACK;
    re.Parent = folder;
    return re;
  }

  /**
   * 攻撃処理の入口
   * - Character / Humanoid / Tool を検証
   * - 武器設定（WeaponCatalog）を決定
   * - サーバ側クールダウンを検証
   * - 有効フレーム中の当たり判定ループ（HitWindow）を開始
   */
  private _onMeleeAttack(player: Player): void {
    const char = player.Character;
    if (!char) return;

    // キャラの生存確認（死んでいる間は攻撃を無視）
    const hum = char.FindFirstChildOfClass('Humanoid');
    if (!hum || hum.Health <= 0) return;

    // Character直下の Tool（装備中の武器）を取得
    // ※ 今の仕様は「装備中のToolが武器」という前提。将来複数Toolを扱う場合は見直す。
    const tool = char.FindFirstChildOfClass('Tool');
    if (!tool) return;

    // Tool名から武器IDを特定
    const weaponId = tryGetWeaponIdFromTool(tool);
    if (!weaponId) return;

    const weapon = WEAPON_CATALOG[weaponId];

    // サーバ側クールダウン検証
    const now = os.clock();
    const last = this._lastAttackAt.get(player.UserId);
    if (last !== undefined && now - last < weapon.cooldownSec) {
      // 連打抑止（クライアント改造対策）
      return;
    }
    this._lastAttackAt.set(player.UserId, now);

    logger.debug('PlayerMeleeAttack', `装備中のツール: ${tool.Name}`);

    // 有効フレーム中だけ当たり判定を出す（自然さを保ちつつ当たりやすくする）
    this._startHitWindow(player, char, tool, weapon);
  }

  /**
   * 攻撃の「有効フレーム」中だけ、一定間隔で当たり判定を出し続ける
   * - hitStartSec: 攻撃開始（Remote受信）から何秒後に判定開始するか
   * - hitEndSec:   攻撃開始（Remote受信）から何秒後に判定終了するか
   * - hitSampleIntervalSec: サンプリング間隔（短いほど当たりやすいが負荷は増える）
   */
  private _startHitWindow(
    player: Player,
    char: Model,
    tool: Tool,
    weapon: WeaponConfig,
  ): void {
    // 新しい攻撃が開始されるたびにトークンを更新
    const token = (this._swingToken.get(player.UserId) ?? 0) + 1;
    this._swingToken.set(player.UserId, token);

    // 有効フレームの終了時刻（絶対時刻）
    const endAt = os.clock() + weapon.hitEndSec;

    // 1スイング中に既にヒット処理した敵（多段ヒット防止）
    const hitAlready = new Set<Model>();

    // hitStartSec まで待ってから判定ループを開始する（構え中に当たる不自然さを防ぐ）
    task.delay(weapon.hitStartSec, () => {
      // 途中で次の攻撃が始まっていたら、このウィンドウは中止
      if (this._swingToken.get(player.UserId) !== token) return;

      // 有効フレーム中、一定間隔で繰り返し判定
      while (os.clock() < endAt) {
        // --- 安全策：状態が変わったら停止 ---
        if (!player.Parent) break; // プレイヤーが離脱などで無効になった
        if (!char.Parent) break; // キャラが消えた（リスポーン等）
        const hum = char.FindFirstChildOfClass('Humanoid');
        if (!hum || hum.Health <= 0) break;

        // 装備解除されていたら停止（攻撃中に武器を外した等）
        const equipped = char.FindFirstChildOfClass('Tool');
        if (equipped !== tool) break;

        // トークンが更新されていたら停止（次の攻撃が開始されている）
        if (this._swingToken.get(player.UserId) !== token) break;

        // --- 空間クエリ：剣が当たった敵を取得 ---
        const hit = detectSwordEnemiesByBox(
          char,
          tool,
          weapon.hitboxThickness,
          weapon.maxHitsPerSwing,
        );

        logger.debug(
          'PlayerMeleeAttack',
          `ヒット判定: enemies=${hit.enemies.size()} (max=${weapon.maxHitsPerSwing})`,
        );

        // 敵にダメージ適用（最大 maxHitsPerSwing まで）
        for (const enemy of hit.enemies) {
          // 1スイング中の多段ヒット防止
          if (hitAlready.has(enemy)) continue;
          hitAlready.add(enemy);

          const result = applyDamageToEnemy(enemy, weapon.damage);

          if (Result.isOk(result)) {
            logger.debug(
              'PlayerMeleeAttack',
              `ダメージ適用: enemy=${enemy.Name} killed=${tostring(result.value.killed)} damage=${weapon.damage}`,
            );

            // killed なら死亡後処理
            if (result.value.killed) {
              finalizeEnemyDeath(enemy);
            }
          } else {
            logger.debug(
              'PlayerMeleeAttack',
              `ダメージ失敗: enemy=${enemy.Name} reason=${result.error}`,
            );
          }

          // 上限に達したらこのスイングの判定を終了
          if (hitAlready.size() >= weapon.maxHitsPerSwing) break;
        }

        // 上限に達したらループを抜ける（軽量化）
        if (hitAlready.size() >= weapon.maxHitsPerSwing) break;

        // 次サンプルまで待機
        task.wait(weapon.hitSampleIntervalSec);
      }
    });
  }
}

export const playerMeleeAttackService = new PlayerMeleeAttackService();
