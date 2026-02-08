// ProximityPromptsからDestinationを取得し、TeleportServiceを呼び出す。
// ROBLOX Studio依存の処理はすべてここで行う。

import { CollectionService } from '@rbxts/services';
import { ATTRS, TAGS } from 'shared/constants';
import { logger } from 'shared/utils/logger';
import { assertIsPlaceKey } from 'shared/utils/type-guards';
import { enemySpawnService } from '../../features/enemy/EnemySpawnService';
import { requestTeleport } from '../../services/TeleportService';

// すでにバインドされたProximityPromptを記録、2重処理を避ける。
const boundPrompts = new Set<ProximityPrompt>();

function bindTeleportPrompt(prompt: ProximityPrompt) {
  if (boundPrompts.has(prompt)) return; // すでにバインド済み
  boundPrompts.add(prompt);

  // プレイヤーがProximityPromptをトリガーしたときの処理
  const conn = prompt.Triggered.Connect((Player) => {
    const placeName = prompt.GetAttribute(ATTRS.DESTINATION);
    if (!assertIsPlaceKey(placeName)) {
      logger.warn(
        'Teleport',
        `定義されていない目的地: prompt=${prompt.GetFullName()} placeName=${tostring(placeName)}`,
      );
      return;
    }

    logger.info(
      'Teleport',
      `${Player.Name} が ${placeName} にテレポートしました`,
    );
    const result = requestTeleport({
      player: Player,
      destination: placeName,
    });
    if (!result.status) return;

    // テレポート成功後、敵が生成されるべきか確認する
    task.delay(0.2, () => {
      // テレポート後の処理: 敵スポーンの更新
      enemySpawnService.updateSpawnStateByPlayer(Player, placeName);
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
  const tagged = CollectionService.GetTagged(TAGS.TELEPORT_PROMPT);
  logger.info('Teleport', `Teleportタグを ${tagged.size()} 件検出`);

  for (const inst of tagged) {
    logger.debug(
      'Teleport',
      `Teleportタグ: class=${inst.ClassName} name=${inst.GetFullName()}`,
    );
    applyBindTeleportPrompt(inst);
  }
}

// タグ付与イベントの監視を開始
CollectionService.GetInstanceAddedSignal(TAGS.TELEPORT_PROMPT).Connect(
  (inst) => {
    applyBindTeleportPrompt(inst);
  },
);
