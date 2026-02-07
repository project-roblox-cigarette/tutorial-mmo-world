import { CollectionService } from '@rbxts/services';
import { TAGS } from 'shared/constants';
import { EnemyChaseSystem } from './features/enemy/ai/EnemyChaseSystem';
import { EnemyContactAttackService } from './features/enemy/combat/EnemyContactAttackService';
import { playerMeleeAttackService } from './features/player/combat/PlayerMeleeAttackService';

print('[Server] サーバーが起動しました');

const enemyChaseSystem = new EnemyChaseSystem();
enemyChaseSystem.start();
const enemyContactAttackService = new EnemyContactAttackService();
enemyContactAttackService.start();
playerMeleeAttackService.start();

task.delay(2, () => {
  const tagged = CollectionService.GetTagged(TAGS.ENEMY);

  const n = tagged.size();
  print(`[DBG] tagged enemies = ${n}`);

  for (const inst of tagged) {
    print(
      `[DBG] enemy: ${inst.GetFullName()} parent=${inst.Parent ? inst.Parent.GetFullName() : 'nil'}`,
    );
  }
});
