# 依存セキュリティ対策（2026-10-22）

## 変更

masterの既存ESLint/Prettier構成を維持し、ESLint 10・TypeScript ESLint 8へ更新。脆弱なnpm版Rojoと導入スクリプトが必要なnpm版StyLuaを削除し、Aftman管理のRojo 7.6.1・StyLuaを利用します。コンパイラはTypeScript 5.5.3に揃え、chokidar 6.0.0とpollingを使用します。ゲーム機能は変更しません。

Node.js 22.23.4 / pnpm 12.14.0を固定し、起動・ビルド・検査で実際の版とpnpmのuser agentを確認します。npm/yarnや別バージョンでのスクリプト実行は拒否します。新規導入は`pnpm run deps:install`を使います。

`engineStrict`、公開から最低24時間の待機、発行時刻不明の拒否、`trustPolicy: no-downgrade`、`blockExoticSubdeps`、`ignoreScripts`を適用します。依存の導入スクリプトは自動実行しません。

## 依存一覧を送信しない監査

初回は`node scripts/prepare-offline-audit.mjs`でSHA256を固定した公式OSV Scanner 2.7.0とnpm全体の公開脆弱性DBを取得します。`pnpm run deps:audit`は固定ロックをローカル照合し、検出があれば失敗します。既知脆弱版の正例とパッケージ認識数を確認し、空の監査を成功扱いしません。CIも同じ方式で、監査APIへ依存一覧を送りません。

## 検証

最新masterから独立した作業コピーで固定導入、ガード3テスト、Luauビルド、ESLint、Prettier、固定版StyLua/Selene、監視中の追加/変更/削除、Rojoのplace組立に成功しました。2026-10-22取得の公開DBによる既知脆弱性は0件でした。Roblox Studioでのプレイ・TestEZ実行・公開は対象外です。

この固定版を将来も安全と保証するものではありません。新たな公開情報と公開DBで照合し、受入バージョンとロックを検証して更新してください。
