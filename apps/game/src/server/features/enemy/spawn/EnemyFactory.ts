// server/features/enemy/spawn/EnemyFactory.ts
import { CollectionService, ServerStorage } from '@rbxts/services';
import {
  ATTR_AGGRO_RANGE,
  ATTR_CHASE_SPEED,
  ATTR_CHASE_TICK,
  ATTR_STOP_DISTANCE,
  TAG_ENEMY,
} from 'shared/constants';

const templatesFolder = ServerStorage.WaitForChild('EnemyTemplates') as Folder;

export function createEnemyFromTemplateName(templateName: string): Model {
  const inst = templatesFolder.FindFirstChild(templateName);
  if (!inst || !inst.IsA('Model')) {
    error(`Enemy template not found or not a Model: ${templateName}`);
  }

  print(`[EnemyFactory][DBG] createEnemyFromTemplateName: ${templateName}`);

  const instanceEnemyModel = inst.Clone();
  instanceEnemyModel.SetAttribute('TemplateName', templateName);

  print(`[EnemyFactory][DBG] createEnemyFromTemplateName: ${templateName}`);

  CollectionService.GetInstanceAddedSignal(TAG_ENEMY).Connect((inst) => {
    print(
      `[EnemyTag][DBG] added: class=${inst.ClassName} name=${inst.GetFullName()} parent=${inst.Parent ? inst.Parent.GetFullName() : 'nil'}`,
    );
  });

  CollectionService.GetInstanceRemovedSignal(TAG_ENEMY).Connect((inst) => {
    print(`[EnemyTag][DBG] removed: name=${inst.GetFullName()}`);
  });

  // Tag付与
  CollectionService.AddTag(instanceEnemyModel, TAG_ENEMY);

  // デフォルト値（未設定なら付与）
  if (instanceEnemyModel.GetAttribute(ATTR_AGGRO_RANGE) === undefined)
    instanceEnemyModel.SetAttribute(ATTR_AGGRO_RANGE, 60);
  if (instanceEnemyModel.GetAttribute(ATTR_STOP_DISTANCE) === undefined)
    instanceEnemyModel.SetAttribute(ATTR_STOP_DISTANCE, 4);
  if (instanceEnemyModel.GetAttribute(ATTR_CHASE_SPEED) === undefined)
    instanceEnemyModel.SetAttribute(ATTR_CHASE_SPEED, 14);
  if (instanceEnemyModel.GetAttribute(ATTR_CHASE_TICK) === undefined)
    instanceEnemyModel.SetAttribute(ATTR_CHASE_TICK, 0.2);

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
