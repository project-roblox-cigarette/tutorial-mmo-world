// ProximityPromptsからDestinationを取得し、TeleportServiceを呼び出す。
// ROBLOX Studio依存の処理はすべてここで行う。

import { CollectionService } from '@rbxts/services';
import {
  ATTR_DESTINATION,
  assertIsPlaceKey,
  TELEPORT_PROMPT_TAG,
} from '../../../shared/Places';
import { requestTeleport } from '../../services/TeleportService';

// すでにバインドされたProximityPromptを記録、2重処理を避ける。
const boundPrompts = new Set<ProximityPrompt>();

function bindTeleportPrompt(prompt: ProximityPrompt) {
  if (boundPrompts.has(prompt)) return; // すでにバインド済み
  boundPrompts.add(prompt);

  // プレイヤーがProximityPromptをトリガーしたときの処理
  const conn = prompt.Triggered.Connect((Player) => {
    const placeName = prompt.GetAttribute(ATTR_DESTINATION);
    if (!assertIsPlaceKey(placeName)) {
      warn(
        `[Teleport] 定義されていない目的地： prompt=${prompt.GetFullName()} placeName=${tostring(
          placeName,
        )}`,
      );
      return;
    }

    print(`[Server] ${Player.Name} が ${placeName} にテレポートしました`);
    requestTeleport({
      player: Player,
      destination: placeName,
    });
  });

  prompt.Destroying.Connect(() => {
    conn.Disconnect();
    boundPrompts.delete(prompt);
  });
}

/**
 * ProximityPromptがあるときbindTeleportPromtを呼び出す
 */
function applyBindTeleportPrompt(inst: Instance) {
  if (inst.IsA('ProximityPrompt')) {
    bindTeleportPrompt(inst);
  } else {
    warn(`[Teleport] ProximityPromptタグがありません。: ${inst.GetFullName()}`);
  }
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
    applyBindTeleportPrompt(inst);
  }
}

// タグ付与イベントの監視を開始
CollectionService.GetInstanceAddedSignal(TELEPORT_PROMPT_TAG).Connect(
  (inst) => {
    applyBindTeleportPrompt(inst);
  },
);
