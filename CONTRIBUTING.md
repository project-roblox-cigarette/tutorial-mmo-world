# コントリビューションガイド

このプロジェクトへの貢献ありがとうございます！このガイドでは、開発の流れとルールを説明します。

## 📋 目次

- [開発環境のセットアップ](#-開発環境のセットアップ)
- [開発の流れ](#-開発の流れ)
- [コーディング規約](#-コーディング規約)
- [コミットルール](#-コミットルール)
- [プルリクエスト](#-プルリクエスト)
- [レビュープロセス](#-レビュープロセス)

---

## 🐳 開発環境のセットアップ

### Dev Container（推奨）

Dev Container を使用すると、全員が同じ開発環境で作業できます。

```bash
# 1. リポジトリをクローン
git clone https://github.com/your-org/tutorial-mmo-world.git
cd tutorial-mmo-world

# 2. VS Code で開く
code .

# 3. 「Reopen in Container」を選択
#    → 自動で環境構築が完了します

# 4. 開発サーバーを起動
pnpm dev:game

# 5. ホストマシンの Roblox Studio で Rojo プラグインから接続（ポート 34872）
```

### Dev Container の利点

| メリット         | 説明                             |
| ---------------- | -------------------------------- |
| 環境の統一       | 全員が同じツールバージョンで開発 |
| セットアップ簡略 | Docker さえあれば即座に開発開始  |
| 依存関係の分離   | ローカル環境を汚さない           |
| 問題の再現性     | 「自分の環境では動く」問題を排除 |

---

## 🎯 開発の流れ

### 1. Issue を確認・作成

- 既存の Issue がないか確認
- 新しい機能やバグは Issue を作成してから着手
- 作業する Issue に自分をアサイン

### 2. ブランチを作成

```bash
# develop から最新を取得
git checkout develop
git pull origin develop

# 作業ブランチを作成
git checkout -b feature/player-inventory  # 新機能
git checkout -b fix/respawn-bug           # バグ修正
git checkout -b refactor/network-layer    # リファクタ
git checkout -b docs/update-readme        # ドキュメント
```

### 3. 開発

```bash
# 開発サーバー起動
pnpm dev:game

# Roblox Studio で Rojo Connect
# → コード変更が自動で反映されます
```

### 4. コミット

```bash
git add .
git commit -m "feat: プレイヤーインベントリ機能を追加"
```

> 💡 コミット時に Husky が自動でビルド・Lint・フォーマットをチェックします。

### 5. プルリクエスト

```bash
git push origin feature/player-inventory
# GitHub で PR を作成
```

---

## 📂 ディレクトリ構成と担当

コンフリクトを避けるため、担当範囲を明確にしてください。

```
apps/game/src/
├── client/                    # クライアント（プレイヤーのデバイス）
│   ├── main.client.ts         # エントリーポイント
│   ├── ui/                    # UI コンポーネント
│   ├── input/                 # 入力処理
│   └── effects/               # ローカルエフェクト
├── server/                    # サーバー（権威的な処理）
│   ├── main.server.ts         # エントリーポイント
│   ├── services/              # ビジネスロジック
│   ├── data/                  # データストア
│   └── Players/               # プレイヤー管理
└── shared/                    # クライアント・サーバー共通
    ├── constants.ts           # 定数
    ├── types.ts               # 型定義
    └── utils/                 # ユーティリティ
```

### 共有コードの変更

`packages/shared/` や `src/shared/` を変更する場合：

1. **事前にチームに通知**
2. **影響範囲を明記**した PR を作成
3. **複数人のレビュー**を受ける

---

## 📝 コーディング規約

### 命名規則

```typescript
// クラス・型・インターフェース: PascalCase
interface PlayerData {}
class InventoryService {}
type WeaponType = 'sword' | 'bow';

// 関数・変数: camelCase
function calculateDamage() {}
const playerHealth = 100;

// 定数: UPPER_SNAKE_CASE
const MAX_PLAYERS = 50;
const DEFAULT_SPAWN_POSITION = new Vector3(0, 10, 0);

// ファイル名
// - クライアント: xxx.client.ts
// - サーバー: xxx.server.ts
// - その他: camelCase.ts または kebab-case.ts
```

### インポート順序

```typescript
// 1. Roblox サービス
import { Players, ReplicatedStorage } from '@rbxts/services';

// 2. 外部パッケージ
import { Signal } from '@rbxts/signal';

// 3. 内部パッケージ（ワークスペース）
import { PlayerData } from '@packages/shared';

// 4. 相対インポート
import { calculateDamage } from './utils';
```

### コメント

```typescript
/**
 * プレイヤーにダメージを与える
 * @param player - 対象プレイヤー
 * @param damage - ダメージ量
 * @returns 残りHP
 */
function dealDamage(player: Player, damage: number): number {
  // TODO: シールド計算を追加
  return currentHealth - damage;
}
```

---

## 💬 コミットルール

### メッセージ形式

[Angular 規約](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format)に従います。

```
<type>: <description>
```

### Type 一覧

| Type       | 説明                           | 例                                       |
| ---------- | ------------------------------ | ---------------------------------------- |
| `feat`     | 新機能                         | `feat: プレイヤーインベントリ機能を追加` |
| `fix`      | バグ修正                       | `fix: リスポーン時のバグを修正`          |
| `docs`     | ドキュメント                   | `docs: README を更新`                    |
| `style`    | フォーマット（動作に影響なし） | `style: インデントを修正`                |
| `refactor` | リファクタリング               | `refactor: ネットワーク層を整理`         |
| `perf`     | パフォーマンス改善             | `perf: ループ処理を最適化`               |
| `test`     | テスト                         | `test: ダメージ計算のテストを追加`       |
| `chore`    | ビルド・ツール・依存関係       | `chore: ESLint 設定を更新`               |

### 良いコミットメッセージ

```bash
# ✅ 良い例
feat: プレイヤーのHP表示UIを追加
fix: アイテム購入時にゴールドが減らないバグを修正
refactor: PlayerService のメソッドを整理

# ❌ 悪い例
fix: バグ修正
update: 更新
WIP
```

---

## 🔀 プルリクエスト

### PR 作成のルール

1. **1 PR = 1 機能/修正**（巨大な PR は避ける）
2. **タイトルはコミットメッセージと同じ形式**
3. **テンプレートに従って記述**

### PR チェックリスト

- [ ] ビルドが通る（`pnpm build`）
- [ ] Lint エラーがない（`pnpm lint`）
- [ ] フォーマットが正しい（`pnpm format:check`）
- [ ] セルフレビューを行った
- [ ] 関連 Issue をリンクした

### CI チェック

PR を作成すると GitHub Actions が自動実行されます。すべてのチェックを通過しないとマージできません。

---

## 👀 レビュープロセス

### レビュアーの責務

1. **コードの品質**を確認
2. **パフォーマンス**への影響を考慮
3. **セキュリティ**の問題がないか確認
4. **テスト**が十分か確認

### レビュー後のマージ

1. 最低 **1 人**のレビュー承認が必要
2. CI がすべて通過
3. **Squash and merge** を推奨

---

## ⚠️ 禁止事項

| 禁止事項                       | 理由                     |
| ------------------------------ | ------------------------ |
| `main` への直接プッシュ        | 本番環境を保護するため   |
| レビューなしマージ             | 品質担保のため           |
| ビルドが壊れた状態でのプッシュ | 他のメンバーの作業に影響 |
| 他人の担当フォルダの無断変更   | コンフリクト防止         |

---

## 🆘 困ったときは

| 状況               | 対処法                                |
| ------------------ | ------------------------------------- |
| コンフリクトが発生 | `git pull origin develop` してマージ  |
| ビルドエラー       | `rm -rf node_modules && pnpm install` |
| Rojo 接続エラー    | `pnpm dev:game` を再起動              |
| わからないこと     | Slack/Discord でチームに質問          |

---

ご質問があれば、お気軽に Issue を作成するか、チームメンバーに連絡してください！
