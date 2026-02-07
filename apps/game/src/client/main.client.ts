// クライアントエントリーポイント
// プレイヤーのデバイスで実行される初期化処理

import { Players } from '@rbxts/services';
import { waitSeconds } from 'shared/utils';
import { startPlayerAttackController } from './features/player/combat/PlayerAttackController';

// ゲーム初期化
async function initialize(): Promise<void> {
  print(`[Client] ${Players.LocalPlayer.Name} がゲームに参加しました`);

  print('[Client] 入力ハンドラを設定しました');

  startPlayerAttackController();

  // 少し待機（UIのロードなどをシミュレート）
  await waitSeconds(0.5);

  print('[Client] クライアント初期化完了');
}

initialize();
