/**
 * 敵の追跡AIスクリプト
 *
 * このスクリプトは各敵Model内に配置され、スポーン時に自動実行されます。
 * プレイヤーを追跡し、一定距離で停止する動作を実装します。
 *
 * 配置場所：
 *   Roblox: ServerStorage/Spawnables/[敵Model名]/EnemyAI
 *   Source: src/server/features/enemy/ai/EnemyChaseAI.server.ts
 */

import { RunService } from '@rbxts/services';
import { ATTRIBUTES } from 'shared/constants';
import { getEnemyType } from 'shared/types/enemy';
import {
  findNearestPlayer,
  getHumanoidFromModel,
  getNumberAttribute,
  getRootPartFromModel,
  logger,
} from 'shared/utils';

// このスクリプトの親Model（敵キャラクター）を取得
const enemyModel = script.Parent;

if (!enemyModel || !enemyModel.IsA('Model')) {
  const parentInfo = enemyModel
    ? `親: ${enemyModel.ClassName} (${enemyModel.GetFullName()})`
    : '親: nil';
  logger.error(
    'EnemyChaseAI',
    `スクリプトの親がModelではありません - ${parentInfo}`,
  );
  throw 'EnemyChaseAIスクリプトはModel内に配置されなければなりません';
}

// Humanoidを取得
const humanoid = getHumanoidFromModel(enemyModel);
if (!humanoid) {
  logger.warn(
    'EnemyChaseAI',
    `敵にHumanoidがありません: Model=${enemyModel.Name} FullPath=${enemyModel.GetFullName()} Parent=${enemyModel.Parent?.GetFullName() ?? 'nil'}`,
  );
  throw '敵ModelにHumanoidがありません';
}

// RootPartを取得
const rootPart = getRootPartFromModel(enemyModel);
if (!rootPart) {
  const children = enemyModel.GetChildren().map((c) => c.Name);
  logger.warn(
    'EnemyChaseAI',
    `敵にRootPartがありません: Model=${enemyModel.Name} FullPath=${enemyModel.GetFullName()} PrimaryPart=${enemyModel.PrimaryPart?.Name ?? 'nil'} Children=[${children.join(', ')}]`,
  );
  throw '敵ModelにRootPartがありません';
}

logger.debug('EnemyChaseAI', `起動: ${enemyModel.Name}`);

// AI設定を読み取り
const aggroRange = getNumberAttribute(enemyModel, ATTRIBUTES.AggroRange, 60);
const stopDistance = getNumberAttribute(enemyModel, ATTRIBUTES.StopDistance, 4);
const chaseSpeed = getNumberAttribute(enemyModel, ATTRIBUTES.ChaseSpeed, 14);

// 敵タイプの判定（将来の拡張用）
const enemyType = getEnemyType(enemyModel);

// AI更新のスロットリング
let accumulatedTime = 0;
const updateInterval = 0.05; // 0.05秒ごとに更新（よりスムーズに）

// 前回のMoveTo呼び出し位置を記録（無駄な再計算を防ぐ）
let lastMoveToPosition: Vector3 | undefined;
const moveToThreshold = 3; // 3スタッド以上動いたら再度MoveTo()

// Heartbeat接続
const heartbeatConnection = RunService.Heartbeat.Connect((deltaTime) => {
  accumulatedTime += deltaTime;

  if (accumulatedTime < updateInterval) {
    return;
  }

  accumulatedTime = 0;

  // 敵タイプに応じてAIを切り替え（将来の拡張用）
  switch (enemyType) {
    case 'Chase':
      updateChaseAI();
      break;
    case 'Patrol':
      // 将来実装: パトロールAI
      break;
    case 'Ranged':
      // 将来実装: 遠距離攻撃AI
      break;
    default:
      updateChaseAI();
  }
});

// クリーンアップ（Modelが削除されたら停止）
enemyModel.AncestryChanged.Connect((_, parent) => {
  if (!parent) {
    logger.debug('EnemyChaseAI', `停止: ${enemyModel.Name}`);
    heartbeatConnection.Disconnect();
  }
});

/**
 * 追跡AI（デフォルト）
 */
function updateChaseAI(): void {
  if (!humanoid || !rootPart) {
    return;
  }

  // 最近傍のプレイヤーを検索
  const targetModel = findNearestPlayer(rootPart.Position, aggroRange);
  if (!targetModel) {
    // ターゲットがいない場合は停止
    lastMoveToPosition = undefined;
    return;
  }

  const targetRoot = getRootPartFromModel(targetModel);
  if (!targetRoot) {
    return;
  }

  // 距離を計算
  const toTarget = targetRoot.Position.sub(rootPart.Position);
  const dist = toTarget.Magnitude;

  // StopDistance内なら停止
  if (dist <= stopDistance) {
    lastMoveToPosition = undefined;
    return;
  }

  // プレイヤーを追跡
  humanoid.WalkSpeed = chaseSpeed;

  // 目標位置が大きく変わった場合のみMoveTo()を呼ぶ（スムーズな移動）
  const targetPos = targetRoot.Position;
  let shouldMoveTo = false;

  if (!lastMoveToPosition) {
    // 初回は必ず呼ぶ
    shouldMoveTo = true;
  } else {
    // 前回の目標から一定距離以上離れたら再度MoveTo()
    const distanceFromLastTarget = lastMoveToPosition.sub(targetPos).Magnitude;
    if (distanceFromLastTarget > moveToThreshold) {
      shouldMoveTo = true;
    }
  }

  if (shouldMoveTo) {
    humanoid.MoveTo(targetPos);
    lastMoveToPosition = targetPos;
  }
}
