// クライアントエントリーポイント
// プレイヤーのデバイスで実行される初期化処理

import { Players, UserInputService } from '@rbxts/services';
import { waitSeconds } from 'shared/utils';

const player = Players.LocalPlayer;

// ゲームの状態
interface ClientState {
  isReady: boolean;
  lastInputTime: number;
}

const state: ClientState = {
  isReady: false,
  lastInputTime: 0,
};

// 入力ハンドラの設定
function setupInputHandlers(): void {
  UserInputService.InputBegan.Connect((input, gameProcessed) => {
    if (gameProcessed) return;

    state.lastInputTime = os.clock();

    // キーボード入力の処理例
    if (input.UserInputType === Enum.UserInputType.Keyboard) {
      const keyCode = input.KeyCode;
      if (keyCode === Enum.KeyCode.Space) {
        print('[Client] スペースキーが押されました');
      }
    }
  });
}

// ゲーム初期化
async function initialize(): Promise<void> {
  print(`[Client] ${player.Name} がゲームに参加しました`);

  // 入力ハンドラ設定
  setupInputHandlers();
  print('[Client] 入力ハンドラを設定しました');

  // 少し待機（UIのロードなどをシミュレート）
  await waitSeconds(0.5);

  state.isReady = true;
  print('[Client] クライアント初期化完了');
}

initialize();
