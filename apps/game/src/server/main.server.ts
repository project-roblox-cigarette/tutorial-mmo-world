// サーバーエントリーポイント
// Robloxサーバーで実行される初期化処理

import { Players } from '@rbxts/services';

// プレイヤー参加時の処理
function onPlayerAdded(player: Player): void {
  print(`[Server] ${player.Name} が参加しました`);

  // TODO: プレイヤーデータのロード
  // TODO: キャラクター設定
}

// プレイヤー退出時の処理
function onPlayerRemoving(player: Player): void {
  print(`[Server] ${player.Name} が退出しました`);

  // TODO: プレイヤーデータの保存
}

// イベント登録
Players.PlayerAdded.Connect(onPlayerAdded);
Players.PlayerRemoving.Connect(onPlayerRemoving);

// 既に参加しているプレイヤーの処理
for (const player of Players.GetPlayers()) {
  task.spawn(() => onPlayerAdded(player));
}

print('[Server] サーバーが起動しました');
