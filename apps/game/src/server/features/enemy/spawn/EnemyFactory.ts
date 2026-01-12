// server/features/enemy/spawn/EnemyFactory.ts
import { CollectionService, ServerStorage } from '@rbxts/services';
import {
  TAG_ENEMY,
  ATTR_AGGRO_RANGE,
  ATTR_STOP_DISTANCE,
  ATTR_CHASE_SPEED,
  ATTR_CHASE_TICK,
} from 'shared/constants';

const templatesFolder = ServerStorage.WaitForChild('EnemyTemplates') as Folder;

export function createEnemyFromTemplateName(templateName: string): Model {
  const inst = templatesFolder.FindFirstChild(templateName);
  if (!inst || !inst.IsA('Model')) {
    error(`Enemy template not found or not a Model: ${templateName}`);
  }

  print(`[EnemyFactory][DBG] createEnemyFromTemplateName: ${templateName}`);

  const model = inst.Clone();
  model.SetAttribute('TemplateName', templateName);

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
  CollectionService.AddTag(model, TAG_ENEMY);

  // デフォルト値（未設定なら付与）
  if (model.GetAttribute(ATTR_AGGRO_RANGE) === undefined)
    model.SetAttribute(ATTR_AGGRO_RANGE, 60);
  if (model.GetAttribute(ATTR_STOP_DISTANCE) === undefined)
    model.SetAttribute(ATTR_STOP_DISTANCE, 4);
  if (model.GetAttribute(ATTR_CHASE_SPEED) === undefined)
    model.SetAttribute(ATTR_CHASE_SPEED, 14);
  if (model.GetAttribute(ATTR_CHASE_TICK) === undefined)
    model.SetAttribute(ATTR_CHASE_TICK, 0.2);

  // PrimaryPart を HumanoidRootPart に寄せる（無い場合もあるのでガード）
  const hrp = model.FindFirstChild('HumanoidRootPart');
  if (!model.PrimaryPart && hrp?.IsA('BasePart')) {
    model.PrimaryPart = hrp;
  }

  // 追尾が動かない典型原因：テンプレが Anchored のまま
  for (const d of model.GetDescendants()) {
    if (d.IsA('BasePart')) d.Anchored = false;
  }

  return model;
}
