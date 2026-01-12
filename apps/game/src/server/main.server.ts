import { EnemyChaseSystem } from './features/enemy/ai/EnemyChaseSystem';
import { CollectionService } from '@rbxts/services';
import { TAG_ENEMY } from 'shared/constants';
import { EnemyContactAttackService } from './features/enemy/combat/EnemyContactAttackService';

print('[Server] サーバーが起動しました');

const enemyChaseSystem = new EnemyChaseSystem();
enemyChaseSystem.start();
const enemyContactAttackService = new EnemyContactAttackService();
enemyContactAttackService.start();

task.delay(2, () => {
  const tagged = CollectionService.GetTagged(TAG_ENEMY);

  let n = 0;
  for (const _ of tagged) n++;
  print(`[DBG] tagged enemies = ${n}`);

  for (const inst of tagged) {
    print(
      `[DBG] enemy: ${inst.GetFullName()} parent=${inst.Parent ? inst.Parent.GetFullName() : 'nil'}`,
    );
  }
});
