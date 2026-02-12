/**
 * 敵キャラクターAIスクリプト
 *
 * このスクリプトは各敵Model内に配置され、スポーン時に自動実行されます。
 * 敵ごとに異なる動作を実装できるよう、Model名やAttributeで動作を分岐できます。
 *
 * 配置場所：ServerStorage/Spawnables/[敵Model名]/EnemyAI
 */

import { Players, RunService } from '@rbxts/services';
import { ATTRIBUTES } from 'shared/constants';
import { logger } from 'shared/utils/logger';

// このスクリプトの親Model（敵キャラクター）を取得
const enemyModel = script.Parent;

if (!enemyModel || !enemyModel.IsA('Model')) {
  logger.error('EnemyAI', 'スクリプトの親がModelではありません');
  throw 'EnemyAI script must be placed inside a Model';
}

// Humanoidを取得
const humanoid = enemyModel.FindFirstChildOfClass('Humanoid');
if (!humanoid) {
  logger.warn(
    'EnemyAI',
    `敵にHumanoidがありません: ${enemyModel.GetFullName()}`,
  );
  throw 'Enemy Model must have a Humanoid';
}

// RootPartを取得
const rootPart =
  enemyModel.PrimaryPart ??
  (enemyModel.FindFirstChild('HumanoidRootPart') as BasePart | undefined);

if (!rootPart) {
  logger.warn(
    'EnemyAI',
    `敵にRootPartがありません: ${enemyModel.GetFullName()}`,
  );
  throw 'Enemy Model must have a RootPart';
}

logger.debug('EnemyAI', `起動: ${enemyModel.Name}`);

// AI設定を読み取り
const aggroRange =
  (enemyModel.GetAttribute(ATTRIBUTES.AggroRange) as number) ?? 60;
const stopDistance =
  (enemyModel.GetAttribute(ATTRIBUTES.StopDistance) as number) ?? 4;
const chaseSpeed =
  (enemyModel.GetAttribute(ATTRIBUTES.ChaseSpeed) as number) ?? 14;

// 敵タイプの判定（将来の拡張用）
const enemyType = (enemyModel.GetAttribute('EnemyType') as string) ?? 'Chase';

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
    logger.debug('EnemyAI', `停止: ${enemyModel.Name}`);
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

  const targetRoot = getRootByModel(targetModel);
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

/**
 * 最近傍のプレイヤーを検索
 */
function findNearestPlayer(
  position: Vector3,
  range: number,
): Model | undefined {
  const range2 = range * range;
  let bestChar: Model | undefined;
  let bestDist2 = math.huge;

  for (const player of Players.GetPlayers()) {
    const model = player.Character;
    if (!isAliveCharacter(model)) {
      continue;
    }

    const root = getRootByModel(model);
    if (!root) {
      continue;
    }

    const dVector = root.Position.sub(position);
    const dist2 = dVector.Dot(dVector);
    if (dist2 <= range2 && dist2 < bestDist2) {
      bestDist2 = dist2;
      bestChar = model;
    }
  }

  return bestChar;
}

/**
 * ModelからRootPartを取得
 */
function getRootByModel(model: Model): BasePart | undefined {
  return (
    model.PrimaryPart ??
    (model.FindFirstChild('HumanoidRootPart') as BasePart | undefined)
  );
}

/**
 * キャラクターが生存しているか判定
 */
function isAliveCharacter(model?: Model): model is Model {
  if (!model) {
    return false;
  }

  const getHumanoid = model.FindFirstChildOfClass('Humanoid');
  return getHumanoid !== undefined && getHumanoid.Health > 0;
}
