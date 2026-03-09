import { CollectionService } from '@rbxts/services';
import { TAGS } from 'shared/constants';
import { logger } from 'shared/utils/logger';
import { ServiceRegistry } from './core/ServiceRegistry';
import { enemyContactAttackService } from './features/enemy/services';
import { playerMeleeAttackService } from './features/player/services/PlayerMeleeAttackService';
import { shopPromptService } from './features/shop/services';

// サーバーメイン関数
function main(): void {
  logger.info('Server', 'サーバーを起動中...');

  // サービスを登録
  ServiceRegistry.register('PlayerMeleeAttack', playerMeleeAttackService);
  ServiceRegistry.register('EnemyContactAttack', enemyContactAttackService);
  ServiceRegistry.register('ShopPrompt', shopPromptService);

  // 全サービスを起動
  ServiceRegistry.startAll();

  logger.info('Server', 'サーバーが起動しました');

  // デバッグ: 遅延後にタグ付き敵をチェック
  task.delay(2, () => {
    const taggedEnemies = CollectionService.GetTagged(TAGS.ENEMY);
    const enemyCount = taggedEnemies.size();
    logger.debug('Server', `タグ付き敵の数: ${enemyCount}`);

    for (const enemy of taggedEnemies) {
      logger.debug(
        'Server',
        `敵: ${enemy.GetFullName()} parent=${enemy.Parent ? enemy.Parent.GetFullName() : 'nil'}`,
      );
    }
  });
}

main();
