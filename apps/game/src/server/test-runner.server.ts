/**
 * TestEZテストランナー
 * Roblox Studioで実行して、shared/utilsのテストを実行します
 */

import { ReplicatedStorage } from '@rbxts/services';
import TestEZ from '@rbxts/testez';
import { logger } from '../shared/utils';

function main() {
  // テストを実行
  // ReplicatedStorage.Shared.utils からテストファイルを取得
  const sharedFolder = ReplicatedStorage.FindFirstChild('Shared');
  if (!sharedFolder) {
    logger.error(
      'TestRunner',
      'ReplicatedStorage に Shared フォルダが見つかりません',
    );
    return;
  }

  const utilsFolder = sharedFolder.FindFirstChild('utils');
  if (!utilsFolder) {
    logger.error('TestRunner', 'Shared に utils フォルダが見つかりません');
    return;
  }

  const results = TestEZ.TestBootstrap.run([utilsFolder]);

  // 結果を出力
  if (results.failureCount === 0) {
    logger.info(
      'TestRunner',
      `✅ すべてのテストが成功しました！ (${results.successCount} tests)`,
    );
  } else {
    logger.warn(
      'TestRunner',
      `❌ ${results.failureCount} テストが失敗しました (${results.successCount + results.failureCount} 件のテスト中)`,
    );
  }

  // テスト結果の詳細を出力
  logger.info('TestRunner', '\nテスト結果:');
  logger.info('TestRunner', `  成功: ${results.successCount}`);
  logger.info('TestRunner', `  失敗: ${results.failureCount}`);
  logger.info('TestRunner', `  スキップ: ${results.skippedCount}`);
}

main();
