// クライアントエントリーポイント
// プレイヤーのデバイスで実行される初期化処理

import { Players } from '@rbxts/services';
import { logger } from 'shared/utils/logger';
import { waitSeconds } from 'shared/utils/time';
import { startPlayerAttackController } from './features/player/combat/PlayerAttackController';
import { startShopOpenController } from './features/shop/ShopOpenController';

// クライアントメイン関数
async function main(): Promise<void> {
  logger.info('Client', `${Players.LocalPlayer.Name} がゲームに参加しました`);

  logger.info('Client', '入力ハンドラを設定しました');

  startPlayerAttackController();
  startShopOpenController();

  // 少し待機（UIのロードなどをシミュレート）
  await waitSeconds(0.5);

  logger.info('Client', 'クライアント初期化完了');
}

main();
