// ProximityPromptsからDestinationを取得し、TeleportServiceを呼び出す。
// ROBLOX Studio依存の処理はすべてここで行う。

import { CollectionService } from '@rbxts/services';
import { ATTRIBUTES, TAGS } from 'shared/constants';
import { logger } from 'shared/utils/logger';
import { assertIsPlaceKey } from 'shared/utils/type-guards';
import { enemySpawnService } from '../../features/enemy/services/EnemySpawnService';
import { requestTeleport } from '../../services/TeleportService';

// すでにバインドされたProximityPromptを記録、2重処理を避ける。
const boundPrompts = new Set<ProximityPrompt>();

function bindTeleportPrompt(prompt: ProximityPrompt) {
  if (boundPrompts.has(prompt)) return; // すでにバインド済み
  boundPrompts.add(prompt);

  // プレイヤーがProximityPromptをトリガーしたときの処理
  const connection = prompt.Triggered.Connect((player) => {
    const placeName = prompt.GetAttribute(ATTRIBUTES.Destination);
    if (!assertIsPlaceKey(placeName)) {
      logger.warn(
        'Teleport',
        `定義されていない目的地: prompt=${prompt.GetFullName()} placeName=${tostring(placeName)}`,
      );
      return;
    }

    logger.info(
      'Teleport',
      `${player.Name} が ${placeName} にテレポートしました`,
    );
    const result = requestTeleport({
      Player: player,
      Destination: placeName,
    });
    if (!result.Status) return;

    // テレポート成功後、敵が生成されるべきか確認する
    task.delay(0.2, () => {
      // テレポート後の処理: 敵スポーンの更新
      enemySpawnService.updateSpawnStateByPlayer(player, placeName);
    });
  });

  prompt.Destroying.Connect(() => {
    connection.Disconnect();
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
    logger.warn(
      'Teleport',
      `ProximityPromptタグがありません: ${inst.GetFullName()}`,
    );
  }
}

/**
 * 起動時に既存のタグインスタンスをバインドする
 */
export function initTeleportHandler() {
  const taggedPrompts = CollectionService.GetTagged(TAGS.TELEPORT_PROMPT);
  logger.info('Teleport', `Teleportタグを ${taggedPrompts.size()} 件検出`);

  for (const prompt of taggedPrompts) {
    logger.debug(
      'Teleport',
      `Teleportタグ: class=${prompt.ClassName} name=${prompt.GetFullName()}`,
    );
    applyBindTeleportPrompt(prompt);
  }
}

// タグ付与イベントの監視を開始
CollectionService.GetInstanceAddedSignal(TAGS.TELEPORT_PROMPT).Connect(
  (prompt) => {
    applyBindTeleportPrompt(prompt);
  },
);
