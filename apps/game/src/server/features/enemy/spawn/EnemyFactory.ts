// server/features/enemy/spawn/EnemyFactory.ts
import { CollectionService, ServerStorage } from '@rbxts/services';
import { ATTRS, TAGS } from 'shared/constants';

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

  CollectionService.GetInstanceAddedSignal(TAGS.ENEMY).Connect((inst) => {
    print(
      `[EnemyTag][DBG] added: class=${inst.ClassName} name=${inst.GetFullName()} parent=${inst.Parent ? inst.Parent.GetFullName() : 'nil'}`,
    );
  });

  CollectionService.GetInstanceRemovedSignal(TAGS.ENEMY).Connect((inst) => {
    print(`[EnemyTag][DBG] removed: name=${inst.GetFullName()}`);
  });

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
