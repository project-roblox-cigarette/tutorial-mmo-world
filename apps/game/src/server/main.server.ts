import { CollectionService } from '@rbxts/services';
import { TAGS } from 'shared/constants';
import { logger } from 'shared/utils/logger';
import { ServiceRegistry } from './core/ServiceRegistry';
import { EnemyChaseSystem } from './features/enemy/ai/EnemyChaseSystem';
import { EnemyContactAttackService } from './features/enemy/combat/EnemyContactAttackService';
import { playerMeleeAttackService } from './features/player/combat/PlayerMeleeAttackService';

logger.info('Server', 'サーバーを起動中...');

// サービスを登録
const enemyChaseSystem = new EnemyChaseSystem();
const enemyContactAttackService = new EnemyContactAttackService();

ServiceRegistry.register('PlayerMeleeAttack', playerMeleeAttackService);
ServiceRegistry.register('EnemyChase', enemyChaseSystem);
ServiceRegistry.register('EnemyContactAttack', enemyContactAttackService);

// 全サービスを起動
ServiceRegistry.startAll();

logger.info('Server', 'サーバーが起動しました');

// デバッグ: 遅延後にタグ付き敵をチェック
task.delay(2, () => {
  const tagged = CollectionService.GetTagged(TAGS.ENEMY);
  const n = tagged.size();
  logger.debug('Server', `タグ付き敵の数: ${n}`);

  for (const inst of tagged) {
    logger.debug(
      'Server',
      `敵: ${inst.GetFullName()} parent=${inst.Parent ? inst.Parent.GetFullName() : 'nil'}`,
    );
  }
});
