import {
  ContextActionService,
  Players,
  ReplicatedStorage,
} from '@rbxts/services';
import { PLAYER_ANIMS } from 'shared/config/PlayerAnimations';
import { REMOTE_MELEE_ATTACK, REMOTES_FOLDER_NAME } from 'shared/net/Remotes';
import type { MeleeAttackRequest } from 'shared/types/combat';

const ATTACK_ACTION = 'Attack'; // ContextActionServiceでのアクション名
const SWING_COOLDOWN_SEC = 0.5; // 攻撃のクールダウン時間

/**
 * Toolが剣かどうかを判定する。
 * 現在は名前ベースで判定している。
 */
function isSwordTool(tool: Tool) {
  return tool.Name === 'Sword_Lv0';
}

/**
 * HumanoidからAnimatorを取得する。なければ新規作成して返す。
 */
function getAnimator(humanoid: Humanoid): Animator {
  const found = humanoid.FindFirstChildOfClass('Animator');
  if (found) return found;

  const animator = new Instance('Animator');
  animator.Parent = humanoid;
  return animator;
}

/**
 * 攻撃（剣振り）アニメーションの AnimationTrack を作成して返す。
 * - AnimationId を設定した Animation インスタンスを作り、
 * - Animator.LoadAnimation() で Track を取得する。
 */
function loadSwingTrack(animator: Animator): AnimationTrack {
  const anim = new Instance('Animation');
  anim.AnimationId = PLAYER_ANIMS.swordSwing;

  const track = animator.LoadAnimation(anim);
  track.Priority = Enum.AnimationPriority.Action;
  return track;
}

/**
 * ReplicatedStorageからRemoteEventを取得する
 * サーバー側で作成される前提なのでWaitForChildを使って確実に待つ。
 */
function getMeleeAttackRemote(): RemoteEvent {
  const folder = ReplicatedStorage.WaitForChild(REMOTES_FOLDER_NAME) as Folder;
  const re = folder.WaitForChild(REMOTE_MELEE_ATTACK) as RemoteEvent;
  return re;
}

/**
 * Playerの攻撃入力（Fキー/クリック）を受けて攻撃モーションを再生するコントローラを開始する。
 * - クライアントで動かしてサーバーへ通知する想定。
 * - 将来ここからサーバへ「攻撃開始/当たりタイミング」を通知するよう拡張していく。
 */
export function startPlayerAttackController() {
  const player = Players.LocalPlayer;
  const meleeRemote = getMeleeAttackRemote();

  /**
   * キャラクターに対してAnimator/AnimationTrack の準備
   * - 入力（Fキー）と Tool の Activated を接続を行う。
   *  ※CharacterAddedで毎回呼ぶ。
   */
  const bindCharacter = (character: Model) => {
    // キャラクターからHumanoidを取得
    const humanoid = character.FindFirstChildOfClass('Humanoid');
    if (!humanoid) return;

    const animator = getAnimator(humanoid); // Animator取得
    const swingTrack = loadSwingTrack(animator); // 攻撃アニメのTrackを取得

    let lastSwing = 0; // 最後に攻撃した時間（クールダウン管理用）

    /**
     * 1回のスイングに対してRemoteを二重送信しないためのシーケンス。
     * - Hitマーカーがある場合：マーカー到達で送信
     * - マーカーがない場合：言って位置円で送信
     */
    let swingSeq = 0;
    let sentSeq = -1;

    /**
     * サーバへ攻撃判定してほしい通知を送る。
     */
    const fireAttackRemoteOnce = (seq: number) => {
      // 既にこのスイングで送っているなら何もしない
      if (sentSeq === seq) return;
      sentSeq = seq;

      const tool = getEquippedSword();
      const req: MeleeAttackRequest = {
        debugWeaponName: tool?.Name,
      };

      print('[Attack] FireServer MeleeAttack');
      meleeRemote.FireServer(req);
    };

    /**
     * 装備中の剣を取得する
     * 将来的には名前で直接FindやAttributeで識別等に拡張したほうが良いかも。
     * ※別Toolがあると問題になるから
     */
    const getEquippedSword = (): Tool | undefined => {
      const tool = character.FindFirstChildOfClass('Tool');
      if (tool && isSwordTool(tool)) return tool;
      return undefined;
    };

    /**
     * 攻撃モーションを再生する本体処理
     * 剣が装備されていないなら何もしない
     * クールダウン中なら何もしない
     * 再生中なら軽くStopしてからPlay
     */
    const trySwing = () => {
      const tool = getEquippedSword();
      if (!tool) return;

      const now = os.clock(); // 現在時間取得
      if (now - lastSwing < SWING_COOLDOWN_SEC) return; // クールダウン中は無視
      lastSwing = now; // 攻撃時間を更新

      // 新しいスイングとしてシーケンスを進める
      swingSeq += 1;
      const seq = swingSeq;

      if (swingTrack.IsPlaying) swingTrack.Stop(0.05); // 再生中なら軽くStop

      /**
       * アニメ再生
       * - 第1引数: fadeTime（開始時のフェードイン時間）
       * - 第2引数: weight（ブレンドの重み）
       * - 第3引数: speed（再生速度）
       */
      swingTrack.Play(0.05, 1, 1);

      // アニメに "Hit" マーカーがあるなら、到達時に送信
      //   - マーカーが無い場合、このイベントは発火しない
      const hitConn = swingTrack.GetMarkerReachedSignal('Hit').Connect(() => {
        fireAttackRemoteOnce(seq);
      });

      task.delay(0.12, () => {
        fireAttackRemoteOnce(seq);

        // このスイングのHitConnは不要になるので切断
        hitConn.Disconnect();
      });
    };

    /**
     * Toolのクリックで振るための接続を作る
     */
    const bindToolActivated = (tool: Tool) => {
      if (!isSwordTool(tool)) return;
      tool.Activated.Connect(trySwing);
    };

    /**
     * Characterに Tool が追加されたタイミングで Activated をバインドする。
     * - 装備した瞬間、Toolは Character の子になるため、ここで拾える。
     */
    character.ChildAdded.Connect((child) => {
      if (child.IsA('Tool')) bindToolActivated(child);
    });

    /**
     * すでに装備しているToolがあるケースにも対応。
     * - bindCharacter() が呼ばれた時点で Tool が Character に居る場合に備える。
     */
    const existing = character.FindFirstChildOfClass('Tool');
    if (existing?.IsA('Tool')) bindToolActivated(existing);

    /**
     * Fキー（攻撃ボタン想定）で振る。
     * ContextActionService を使う理由：
     * - キーボード以外（ゲームパッド/タッチ）にも同じ「Attack」アクションとして拡張しやすい
     * - UIボタン追加時もこのアクションを呼ぶ設計にしやすい
     */

    ContextActionService.UnbindAction(ATTACK_ACTION); // 念のため同名アクションを解除（リスポーン等で二重登録を防ぐ）

    // AttackアクションをFキーに紐付ける
    ContextActionService.BindAction(
      ATTACK_ACTION,
      (_actionName, inputState) => {
        // キー押下開始（Begin）の瞬間だけ攻撃を実行
        if (inputState === Enum.UserInputState.Begin) {
          trySwing();
        }
        return Enum.ContextActionResult.Sink;
      },
      false,
      Enum.KeyCode.F,
    );
  };

  /**
   * Characterが消える（リスポーン等）タイミングで、入力バインドを解除する。
   * - 二重登録や不要な入力受付を避ける。
   */
  const unbind = () => {
    ContextActionService.UnbindAction(ATTACK_ACTION);
  };

  /**
   * 起動時点で既にCharacterが存在する場合は即バインドする。
   * その後、リスポーンに備えてイベントも購読する。
   */
  if (player.Character) bindCharacter(player.Character);

  // 新しくCharacterが生成されたら毎回バインド（リスポーン対応）
  player.CharacterAdded.Connect(bindCharacter);

  // Characterが消える直前に解除
  player.CharacterRemoving.Connect(unbind);
}
