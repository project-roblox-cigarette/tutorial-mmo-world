# Tutorial MMO World

Roblox Studio × TypeScript (roblox-ts) による MMO ゲーム開発プロジェクト

## 📋 目次

- [技術スタック](#-技術スタック)
- [環境セットアップ](#-環境セットアップ)
- [プロジェクト構成](#-プロジェクト構成)
- [開発フロー](#-開発フロー)
- [チーム開発ガイドライン](#-チーム開発ガイドライン)
- [トラブルシューティング](#-トラブルシューティング)

---

## 🛠 技術スタック

| ツール                                                | 用途                                  |
| ----------------------------------------------------- | ------------------------------------- |
| [roblox-ts](https://roblox-ts.com/)                   | TypeScript → Luau 変換                |
| [Rojo](https://rojo.space/)                           | ファイルシステム ↔ Roblox Studio 同期 |
| [pnpm](https://pnpm.io/)                              | パッケージ管理（ワークスペース）      |
| [ESLint](https://eslint.org/)                         | TypeScript コード品質                 |
| [Prettier](https://prettier.io/)                      | コードフォーマット                    |
| [Stylua](https://github.com/JohnnyMorganz/StyLua)     | Luau フォーマット                     |
| [TestEZ](https://github.com/Roblox/testez)            | Roblox テストフレームワーク           |
| [Husky](https://typicode.github.io/husky/)            | Git フック                            |
| [GitHub Actions](https://github.com/features/actions) | CI/CD                                 |

---

## 🚀 環境セットアップ

### 推奨: Dev Container を使用する方法 (最も簡単)

**Dev Container** を使用すると、全員が同じ開発環境で作業できます。
Docker と VS Code があれば、面倒な環境構築は不要です。

#### 前提条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) がインストールされていること
- [VS Code](https://code.visualstudio.com/) がインストールされていること
- VS Code 拡張機能 [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) がインストールされていること

#### セットアップ手順

1. **リポジトリをクローン**

   ```bash
   git clone https://github.com/your-org/tutorial-mmo-world.git
   cd tutorial-mmo-world
   ```

2. **VS Code でプロジェクトを開く**

   ```bash
   code .
   ```

3. **Dev Container で開く**

   VS Code が `.devcontainer` フォルダを検出し、「Reopen in Container」の通知が表示されます。
   クリックするか、コマンドパレット（`F1`）で `Dev Containers: Reopen in Container` を実行します。

4. **自動セットアップを待つ**

   初回起動時に以下が自動的に実行されます:
   - pnpm 依存関係のインストール
   - Aftman ツール（Rojo, StyLua, Selene）のインストール
   - TypeScript ビルド

5. **Roblox Studio で接続**

   ```bash
   # Dev Container 内で
   pnpm dev:game
   ```

   ホストマシンの Roblox Studio で Rojo プラグインを使用し、**ポート 34872** に接続します。

> 💡 **注意**: Roblox Studio はホストマシン（Windows/macOS）で実行します。
> Dev Container 内の Rojo サーバーとポートフォワーディング経由で接続します。

---

### 手動セットアップ (従来の方法)

Dev Container を使用しない場合は、以下の手順で手動セットアップしてください。

#### 1. 必須ソフトウェアのインストール

#### Windows

```powershell
# 1. Node.js (v20 LTS 推奨)
# https://nodejs.org/ からダウンロード

# 2. pnpm
npm install -g pnpm

# 3. Aftman (Roblox ツールマネージャー)
# https://github.com/LPGhatguy/aftman/releases から最新版をダウンロード
# aftman.exe を PATH に追加

# 4. Aftman でツールをインストール
aftman install

# 5. Roblox Studio
# https://www.roblox.com/create からダウンロード
```

#### macOS

```bash
# 1. Homebrew（未インストールの場合）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Node.js と pnpm
brew install node
npm install -g pnpm

# 3. Aftman
brew install aftman

# 4. Aftman でツールをインストール
aftman install

# 5. Roblox Studio は公式サイトから
```

### 2. プロジェクトのクローンとセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-org/tutorial-mmo-world.git
cd tutorial-mmo-world

# 依存関係をインストール
pnpm install

# ビルド確認
pnpm build
```

### 3. VS Code 拡張機能のインストール

VS Code を開くと推奨拡張機能のインストールを促されます。
すべてインストールしてください。

または手動で:

```bash
code --install-extension evaera.vscode-rojo
code --install-extension fireboltofdeath.vscode-roblox-ts
code --install-extension JohnnyMorganz.luau-lsp
code --install-extension JohnnyMorganz.stylua
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension eamodio.gitlens
```

### 4. Roblox Studio のセットアップ

1. Roblox Studio を開く
2. **File > Open from File** で `apps/game/game.rbxl` を開く（初回は新規作成）
3. **Plugins** タブで **Rojo** プラグインをインストール
4. Rojo プラグインで **Connect** をクリック

---

## 📁 プロジェクト構成

```
tutorial-mmo-world/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI
├── .husky/
│   └── pre-commit          # コミット前チェック
├── .vscode/
│   ├── extensions.json     # 推奨拡張機能
│   └── settings.json       # エディタ設定
├── apps/
│   └── game/               # メインゲームパッケージ
│       ├── default.project.json  # Rojo プロジェクト
│       ├── package.json
│       ├── tsconfig.json
│       ├── out/            # ビルド出力（Git管理外）
│       └── src/
│           ├── client/     # クライアントスクリプト
│           ├── server/     # サーバースクリプト
│           ├── shared/     # 共有コード
│           └── tests/      # テストコード
├── packages/
│   └── shared/             # チーム共有ライブラリ
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── types.ts    # 共通型定義
│           └── utils.ts    # 共通ユーティリティ
├── aftman.toml             # Aftman ツール定義
├── eslint.config.mjs       # ESLint 設定
├── package.json            # ルートパッケージ
├── pnpm-workspace.yaml     # pnpm ワークスペース定義
├── .prettierrc             # Prettier 設定
├── stylua.toml             # Stylua 設定
└── tsconfig.json           # 共通 TypeScript 設定
```

### Rojo による Roblox Studio マッピング

| ファイルパス  | Roblox Studio 配置先                        |
| ------------- | ------------------------------------------- |
| `out/client/` | `StarterPlayer.StarterPlayerScripts.Client` |
| `out/server/` | `ServerScriptService.Server`                |
| `out/shared/` | `ReplicatedStorage.Shared`                  |
| `out/tests/`  | `ServerScriptService.Tests`                 |

---

## 💻 開発フロー

### 日常の開発

```bash
# 1. 開発サーバーを起動（ファイル監視 + Rojo サーバー）
pnpm dev:game

# 2. Roblox Studio で Rojo Connect
# 3. コードを編集 → 自動で Roblox Studio に反映
```

### コミット前

Husky が自動で以下をチェック:

- ESLint (TypeScript)
- Prettier (フォーマット)
- ビルド

### 手動コマンド

```bash
# ビルド
pnpm build

# Lint
pnpm lint
pnpm lint:fix         # 自動修正

# フォーマット
pnpm format           # 自動修正
pnpm format:check     # チェックのみ

# Luau フォーマット
pnpm format:lua
pnpm format:lua:check
```

---

## 👥 チーム開発ガイドライン

### ブランチ戦略

```
main (本番環境)
  ↑
develop (開発統合)
  ↑
feature/xxx (機能開発)
fix/xxx (バグ修正)
```

### 命名規則

| 種類         | 例                         |
| ------------ | -------------------------- |
| 機能ブランチ | `feature/player-inventory` |
| バグ修正     | `fix/respawn-issue`        |
| リファクタ   | `refactor/network-layer`   |

### コミットメッセージ

[Angular 規約](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format) に従う:

```
feat: プレイヤーインベントリ機能を追加
fix: リスポーン時のバグを修正
refactor: ネットワーク層を整理
docs: README を更新
```

### コンフリクトを避けるためのルール

1. **担当範囲を明確に分ける**
   - プレイヤー担当: `src/server/player/`, `src/client/player/`
   - 戦闘担当: `src/server/combat/`, `src/client/combat/`
   - UI担当: `src/client/ui/`

2. **共有コードの変更は慎重に**
   - `packages/shared/` の変更は事前にチームに共有
   - 型定義の変更は特に影響範囲が大きい

3. **小さく頻繁にコミット**
   - 1つの機能 = 1つの PR
   - 巨大な PR は避ける

4. **develop ブランチを定期的に取り込む**
   ```bash
   git checkout feature/xxx
   git pull origin develop
   git merge develop
   # コンフリクト解決後
   git push
   ```

### コードレビュー

1. PR を作成したら Slack/Discord で通知
2. 最低 1 人のレビューが必要
3. CI が通っていることを確認
4. Squash マージを推奨

---

## 🔄 CI/CD

GitHub Actions で以下を自動実行:

| ジョブ          | 内容                                |
| --------------- | ----------------------------------- |
| `build`         | TypeScript ビルド、ESLint、Prettier |
| `rojo-validate` | Rojo プロジェクト検証               |

PR がすべてのチェックを通過しないとマージ不可。

---

## 🧪 テスト

### TestEZ によるテスト

```typescript
// src/tests/sample.spec.ts
/// <reference types="@rbxts/testez/globals" />

export = () => {
  describe('Sample', () => {
    it('adds numbers', () => {
      expect(1 + 1).to.equal(2);
    });
  });
};
```

### テストの実行

1. Roblox Studio でゲームを再生
2. サーバースクリプトとしてテストが実行される
3. Output ウィンドウで結果を確認

---

## ❓ トラブルシューティング

### Rojo が接続できない

```bash
# Rojo サーバーが起動しているか確認
pnpm dev:game

# ポート 34872 が使用中でないか確認
netstat -ano | findstr :34872  # Windows
lsof -i :34872                  # macOS
```

### ビルドエラー

```bash
# node_modules を再インストール
rm -rf node_modules
pnpm install

# ビルドキャッシュをクリア
rm -rf apps/game/out
pnpm build
```

### TypeScript エラー

```bash
# 型定義を更新
pnpm update @rbxts/types
```

### Git フックが動かない

```bash
# Husky を再インストール
pnpm prepare
```

---

## 📚 参考リンク

- [roblox-ts ドキュメント](https://roblox-ts.com/docs/)
- [Rojo ドキュメント](https://rojo.space/docs/)
- [Roblox Lua スタイルガイド](https://roblox.github.io/lua-style-guide/)
- [TestEZ ドキュメント](https://github.com/Roblox/testez)

---

## 📝 ライセンス

Private - All Rights Reserved
