/**
 * 敵生成ファクトリー
 * - テンプレートから敵モデルを生成
 * - デフォルト属性の設定
 * - タグ付与と初期化
 */

import { CollectionService, ServerStorage } from '@rbxts/services';
import { ATTRS, TAGS } from 'shared/constants';
import { logger } from 'shared/utils/logger';

const templatesFolder = ServerStorage.WaitForChild('EnemyTemplates') as Folder;

/**
 * テンプレート名から敵モデルを生成
 * @param templateName 敵テンプレート名
 * @returns 初期化された敵モデル
 * @throws テンプレートが見つからない場合
 */
export function createEnemyFromTemplateName(templateName: string): Model {
  const inst = templatesFolder.FindFirstChild(templateName);
  if (!inst || !inst.IsA('Model')) {
    error(`敵テンプレートが見つかりません: ${templateName}`);
  }

  logger.debug('EnemyFactory', `敵を生成: template=${templateName}`);

  const instanceEnemyModel = inst.Clone();
  instanceEnemyModel.SetAttribute('TemplateName', templateName);

  // Tag付与
  CollectionService.AddTag(instanceEnemyModel, TAGS.ENEMY);

  // デフォルト値（未設定なら付与）
  if (instanceEnemyModel.GetAttribute(ATTRS.AGGRO_RANGE) === undefined)
    instanceEnemyModel.SetAttribute(ATTRS.AGGRO_RANGE, 60);
  if (instanceEnemyModel.GetAttribute(ATTRS.STOP_DISTANCE) === undefined)
    instanceEnemyModel.SetAttribute(ATTRS.STOP_DISTANCE, 4);
  if (instanceEnemyModel.GetAttribute(ATTRS.CHASE_SPEED) === undefined)
    instanceEnemyModel.SetAttribute(ATTRS.CHASE_SPEED, 14);
  if (instanceEnemyModel.GetAttribute(ATTRS.CHASE_TICK) === undefined)
    instanceEnemyModel.SetAttribute(ATTRS.CHASE_TICK, 0.2);

  // PrimaryPart を HumanoidRootPart に寄せる（無い場合もあるのでガード）
  const hrp = instanceEnemyModel.FindFirstChild('HumanoidRootPart');
  if (!instanceEnemyModel.PrimaryPart && hrp?.IsA('BasePart')) {
    instanceEnemyModel.PrimaryPart = hrp;
  }

  // 追尾が動かない典型原因：テンプレが Anchored のまま
  for (const d of instanceEnemyModel.GetDescendants()) {
    if (d.IsA('BasePart')) d.Anchored = false;
  }

  return instanceEnemyModel;
}
