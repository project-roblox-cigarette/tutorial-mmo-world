/**
 * 敵生成ファクトリー
 * - テンプレートから敵モデルを生成
 * - デフォルト属性の設定
 * - タグ付与と初期化
 */

import { CollectionService, ServerStorage } from '@rbxts/services';
import { ATTRIBUTES, TAGS } from 'shared/constants';
import { logger } from 'shared/utils/logger';

const EnemyTemplates = ServerStorage.WaitForChild('EnemyTemplates') as Folder;

/**
 * テンプレート名から敵モデルを生成
 * @param templateName 敵テンプレート名
 * @returns 初期化された敵モデル
 * @throws テンプレートが見つからない場合
 */
export function createEnemyFromTemplateName(templateName: string): Model {
  const modelTemplate = EnemyTemplates.FindFirstChild(templateName);
  if (!modelTemplate || !modelTemplate.IsA('Model')) {
    error(`敵テンプレートが見つかりません: ${templateName}`);
  }

  logger.debug('EnemyFactory', `敵を生成: template=${templateName}`);

  const clonedEnemyModel = modelTemplate.Clone();
  clonedEnemyModel.SetAttribute('TemplateName', templateName);

  // Tag付与
  CollectionService.AddTag(clonedEnemyModel, TAGS.ENEMY);

  // デフォルト値（未設定なら付与）
  if (clonedEnemyModel.GetAttribute(ATTRIBUTES.AggroRange) === undefined) {
    clonedEnemyModel.SetAttribute(ATTRIBUTES.AggroRange, 60);
  }
  if (clonedEnemyModel.GetAttribute(ATTRIBUTES.StopDistance) === undefined) {
    clonedEnemyModel.SetAttribute(ATTRIBUTES.StopDistance, 4);
  }
  if (clonedEnemyModel.GetAttribute(ATTRIBUTES.ChaseSpeed) === undefined) {
    clonedEnemyModel.SetAttribute(ATTRIBUTES.ChaseSpeed, 14);
  }
  if (clonedEnemyModel.GetAttribute(ATTRIBUTES.ChaseTick) === undefined) {
    clonedEnemyModel.SetAttribute(ATTRIBUTES.ChaseTick, 0.2);
  }
  // PrimaryPart を HumanoidRootPart に寄せる（無い場合もあるのでガード）
  const getHumanoidRootPart =
    clonedEnemyModel.FindFirstChild('HumanoidRootPart');
  if (!clonedEnemyModel.PrimaryPart && getHumanoidRootPart?.IsA('BasePart')) {
    clonedEnemyModel.PrimaryPart = getHumanoidRootPart;
  }

  // 追尾が動かない典型原因：テンプレが Anchored のまま
  for (const descendant of clonedEnemyModel.GetDescendants()) {
    if (descendant.IsA('BasePart')) {
      descendant.Anchored = false;
    }
  }

  return clonedEnemyModel;
}
