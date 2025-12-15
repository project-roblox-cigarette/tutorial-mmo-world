// クライアントエントリーポイント
// プレイヤーのデバイスで実行される初期化処理

import { Players } from '@rbxts/services';

const player = Players.LocalPlayer;

// ゲーム初期化
function initialize(): void {
  print(`[Client] ${player.Name} がゲームに参加しました`);

  // TODO: UI初期化
  // TODO: 入力ハンドラ設定
  // TODO: ネットワークイベント設定
}

initialize();
