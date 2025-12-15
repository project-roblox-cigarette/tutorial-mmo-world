// プレイヤー退出時の処理
export function onPlayerRemoving(player: Player): void {
  print(`[Server] ${player.Name} が退出しました`);
}
