import { Players } from '@rbxts/services';
import { onPlayerAdded } from './handlers/onPlayerAdded';
import { onPlayerRemoving } from './handlers/onPlayerRemoving';

// イベント登録
Players.PlayerAdded.Connect(onPlayerAdded);
Players.PlayerRemoving.Connect(onPlayerRemoving);

// 既に参加しているプレイヤーの処理
for (const player of Players.GetPlayers()) {
  task.spawn(() => onPlayerAdded(player));
}
