// ProximityPromptsからDestinationを取得し、TeleportServiceを呼び出す。
// ROBLOX Studio依存の処理はすべてここで行う。

import { CollectionService } from '@rbxts/services';
import {
  TELEPORT_PROMPT_TAG,
  ATTR_DESTINATION,
  isPlaceKey,
} from '../../../shared/Places';
import { requestTeleport } from '../../services/TeleportService';

// すでにバインドされたProximityPromptを記録、2重処理を避ける。
const boundPrompts = new Set<ProximityPrompt>();

function bindTeleportPrompt(prompt: ProximityPrompt) {
  if (boundPrompts.has(prompt)) return; // すでにバインド済み
  boundPrompts.add(prompt);

  // プレイヤーがProximityPromptをトリガーしたときの処理
  const conn = prompt.Triggered.Connect((Player) => {
    const raw = prompt.GetAttribute(ATTR_DESTINATION);
    if (!isPlaceKey(raw)) {
      warn(
        `[Teleport] 定義されていない目的地： prompt=${prompt.GetFullName()} raw=${tostring(
          raw,
        )}`,
      );
      return;
    }
    print(`[Server] ${Player.Name} が ${raw} にテレポートしました`);
    const result = requestTeleport({
      player: Player,
      destination: raw,
    });
    if (!result.ok) return;
  });

  prompt.Destroying.Connect(() => {
    conn.Disconnect();
    boundPrompts.delete(prompt);
  });
}

/**
 * 起動時に既存のタグインスタンスをバインドする
 */
export function initTeleportHandler() {
  const tagged = CollectionService.GetTagged(TELEPORT_PROMPT_TAG);
  print(`[Teleport] Teleportタグを ${tagged.size()} 件検出`);

  for (const inst of tagged) {
    print(
      `[Teleport] Teleportタグ: class=${inst.ClassName} name=${inst.GetFullName()}`,
    );
    if (inst.IsA('ProximityPrompt')) {
      bindTeleportPrompt(inst);
    } else {
      warn(
        `[Teleport] ProximityPromptタグがありません。: ${inst.GetFullName()}`,
      );
    }
  }
}

// タグ付与イベントの監視を開始
CollectionService.GetInstanceAddedSignal(TELEPORT_PROMPT_TAG).Connect(
  (inst) => {
    if (inst.IsA('ProximityPrompt')) {
      bindTeleportPrompt(inst);
    } else {
      warn(
        `[Teleport] tagged instance is not ProximityPrompt: ${inst.GetFullName()}`,
      );
    }
  },
);
