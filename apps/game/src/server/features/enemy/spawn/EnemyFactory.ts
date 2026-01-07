// server/features/enemy/spawn/EnemyFactory.ts
import { ServerStorage } from '@rbxts/services';

const templatesFolder = ServerStorage.WaitForChild('EnemyTemplates') as Folder;

export function createEnemyFromTemplateName(templateName: string): Model {
  const inst = templatesFolder.FindFirstChild(templateName);
  if (!inst || !inst.IsA('Model')) {
    error(`Enemy template not found or not a Model: ${templateName}`);
  }

  const model = inst.Clone();
  model.SetAttribute('TemplateName', templateName);
  // ここで Tag付与 / Humanoid初期化 / PrimaryPart確認 などを集約すると後々楽
  return model;
}
