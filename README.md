# Tutorial MMO World

[![CI](https://github.com/your-org/tutorial-mmo-world/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/tutorial-mmo-world/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9-orange.svg)](https://pnpm.io/)
[![roblox-ts](https://img.shields.io/badge/roblox--ts-3.0-blue.svg)](https://roblox-ts.com/)

Roblox Studio × TypeScript (roblox-ts) による MMO ゲーム開発プロジェクト

## 📋 目次

- [技術スタック](#-技術スタック)
- [クイックスタート](#-クイックスタート)
- [プロジェクト構成](#-プロジェクト構成)
- [開発コマンド](#-開発コマンド)
- [チーム開発](#-チーム開発)
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
| [StyLua](https://github.com/JohnnyMorganz/StyLua)     | Luau フォーマット                     |
| [Selene](https://kampfkarren.github.io/selene/)       | Luau 静的解析                         |
| [TestEZ](https://github.com/Roblox/testez)            | Roblox テストフレームワーク           |
| [Husky](https://typicode.github.io/husky/)            | Git フック                            |
| [GitHub Actions](https://github.com/features/actions) | CI/CD                                 |

---

## 🚀 クイックスタート

### 推奨: Dev Container（最も簡単）

**Dev Container** を使用すると、全員が同じ開発環境で作業できます。

#### 前提条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code](https://code.visualstudio.com/) + [Dev Containers 拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

#### セットアップ

```bash
# 1. クローン
git clone https://github.com/your-org/tutorial-mmo-world.git
cd tutorial-mmo-world

# 2. VS Code で開く
code .

# 3. 「Reopen in Container」を選択（自動セットアップが実行される）

# 4. 開発サーバー起動
pnpm dev:game
```

> 💡 Roblox Studio はホストマシンで起動し、Rojo プラグインでポート **34872** に接続します。

---

### 手動セットアップ

<details>
<summary>クリックして展開</summary>

#### 必須ソフトウェア

- [Node.js](https://nodejs.org/) v20 LTS
- [pnpm](https://pnpm.io/) v9
- [Aftman](https://github.com/LPGhatguy/aftman)
- [Roblox Studio](https://www.roblox.com/create)

#### Windows

```powershell
# Node.js をインストール後
npm install -g pnpm

# Aftman をインストール後
aftman install
```

#### macOS

```bash
brew install node
npm install -g pnpm
brew install aftman
aftman install
```

#### プロジェクトセットアップ

```bash
git clone https://github.com/your-org/tutorial-mmo-world.git
cd tutorial-mmo-world
pnpm install
pnpm build
```

#### VS Code 拡張機能

```bash
code --install-extension evaera.vscode-rojo
code --install-extension fireboltofdeath.vscode-roblox-ts
code --install-extension JohnnyMorganz.luau-lsp
code --install-extension JohnnyMorganz.stylua
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

</details>

---

## 📁 プロジェクト構成

```
tutorial-mmo-world/
├── apps/
│   └── game/                    # メインゲーム
│       ├── src/
│       │   ├── client/          # クライアントスクリプト
│       │   ├── server/          # サーバースクリプト
│       │   ├── shared/          # 共有コード
│       │   └── tests/           # テストコード
│       ├── include/             # Luau ランタイム
│       └── default.project.json # Rojo 設定
├── packages/
│   └── shared/                  # 共有ライブラリ
├── .github/
│   └── workflows/ci.yml         # GitHub Actions
├── aftman.toml                  # Roblox ツール定義
├── eslint.config.mjs            # ESLint 設定
├── stylua.toml                  # StyLua 設定
└── tsconfig.json                # TypeScript 設定
```

### Rojo マッピング

| ソース        | Roblox Studio                               |
| ------------- | ------------------------------------------- |
| `out/client/` | `StarterPlayer.StarterPlayerScripts.Client` |
| `out/server/` | `ServerScriptService.Server`                |
| `out/shared/` | `ReplicatedStorage.Shared`                  |

---

## 💻 開発コマンド

```bash
# 開発サーバー起動（TypeScript 監視 + Rojo サーバー）
pnpm dev:game

# ビルド
pnpm build

# Lint
pnpm lint          # チェック
pnpm lint:fix      # 自動修正

# フォーマット
pnpm format        # 自動修正
pnpm format:check  # チェック

# Luau フォーマット
pnpm format:lua
pnpm format:lua:check
```

---

## 👥 チーム開発

### ブランチ戦略

```
main     ← 本番環境（保護）
  ↑
develop  ← 開発統合
  ↑
feature/xxx, fix/xxx
```

### コミットメッセージ

[Angular 規約](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format)に従います：

```
feat: プレイヤーインベントリ機能を追加
fix: リスポーン時のバグを修正
refactor: ネットワーク層を整理
docs: README を更新
```

### 詳細なガイドライン

👉 [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

---

## 🧪 テスト

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

Roblox Studio でゲームを再生するとテストが実行されます。

---

## 🔄 CI/CD

GitHub Actions で以下を自動実行：

| ジョブ       | 内容                                |
| ------------ | ----------------------------------- |
| `build`      | TypeScript ビルド、ESLint、Prettier |
| `lua-lint`   | StyLua、Selene                      |
| `rojo-build` | Rojo ビルド検証                     |

PR がすべてのチェックを通過しないとマージできません。

---

## ❓ トラブルシューティング

<details>
<summary><strong>Rojo が接続できない</strong></summary>

```bash
# サーバーが起動しているか確認
pnpm dev:game

# ポートの確認
lsof -i :34872        # macOS/Linux
netstat -ano | findstr :34872  # Windows
```

</details>

<details>
<summary><strong>ビルドエラー</strong></summary>

```bash
# 依存関係を再インストール
rm -rf node_modules
pnpm install

# ビルドキャッシュをクリア
rm -rf apps/game/out
pnpm build
```

</details>

<details>
<summary><strong>Git フックが動かない</strong></summary>

```bash
pnpm prepare
```

</details>

---

## 📚 参考リンク

- [roblox-ts ドキュメント](https://roblox-ts.com/docs/)
- [Rojo ドキュメント](https://rojo.space/docs/)
- [Roblox Luau スタイルガイド](https://roblox.github.io/lua-style-guide/)
- [TestEZ ドキュメント](https://github.com/Roblox/testez)

---

## 📝 ライセンス

Private - All Rights Reserved
