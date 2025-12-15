# コントリビューションガイド

チーム開発をスムーズに進めるためのガイドラインです。

## 🎯 開発の始め方

### 1. ブランチを作成

```bash
# develop から最新を取得
git checkout develop
git pull origin develop

# 新しいブランチを作成
git checkout -b feature/your-feature-name
```

### 2. 開発

```bash
# 開発サーバーを起動
pnpm dev:game

# Roblox Studio で Rojo Connect
```

### 3. コミット

```bash
git add .
git commit -m "feat: 新機能の説明"
```

### 4. プルリクエスト

```bash
git push origin feature/your-feature-name
# GitHub で PR を作成
```

---

## 📂 ファイル配置ルール

### クライアントコード (`src/client/`)

プレイヤーのデバイスで実行されるコード:

- UI 表示・操作
- 入力処理
- ローカルエフェクト
- サーバーへのリクエスト

```
src/client/
├── main.client.ts      # エントリーポイント
├── ui/                 # UI コンポーネント
├── input/              # 入力処理
└── effects/            # ローカルエフェクト
```

### サーバーコード (`src/server/`)

Roblox サーバーで実行されるコード:

- ゲームロジック
- データ永続化
- 権威的な判定
- クライアントへの通知

```
src/server/
├── main.server.ts      # エントリーポイント
├── services/           # ビジネスロジック
├── data/               # データストア
└── network/            # RemoteEvent ハンドラ
```

### 共有コード (`src/shared/`)

クライアント・サーバー両方で使用:

- 定数
- 型定義
- ユーティリティ関数
- ネットワークプロトコル定義

```
src/shared/
├── constants.ts        # 定数
├── types.ts            # 型定義
├── utils/              # ユーティリティ
└── network/            # RemoteEvent 名など
```

---

## 🔀 担当範囲の分け方

コンフリクトを最小限にするため、担当フォルダを明確に:

| 担当         | フォルダ                                 |
| ------------ | ---------------------------------------- |
| プレイヤー   | `server/player/`, `client/player/`       |
| 戦闘         | `server/combat/`, `client/combat/`       |
| インベントリ | `server/inventory/`, `client/inventory/` |
| UI           | `client/ui/`                             |
| ワールド     | `server/world/`                          |

### 共有コードの変更

`packages/shared/` や `src/shared/` を変更する場合:

1. **事前にチームに通知**（Slack/Discord）
2. **影響範囲を明記**した PR を作成
3. **他メンバーのレビュー必須**

---

## 📝 コーディング規約

### 命名規則

```typescript
// クラス・型: PascalCase
interface PlayerData {}
class InventoryService {}

// 関数・変数: camelCase
function calculateDamage() {}
const playerHealth = 100;

// 定数: UPPER_SNAKE_CASE
const MAX_PLAYERS = 50;
const DEFAULT_SPAWN_POSITION = new Vector3(0, 10, 0);

// ファイル名
// クライアント: xxx.client.ts
// サーバー: xxx.server.ts
// その他: kebab-case.ts
```

### インポート順序

```typescript
// 1. Roblox サービス
import { Players, ReplicatedStorage } from '@rbxts/services';

// 2. 外部パッケージ
import { someLib } from '@rbxts/some-lib';

// 3. 内部パッケージ
import { PlayerData } from '@packages/shared';

// 4. 相対インポート
import { localUtil } from './utils';
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

## 🧪 テストの書き方

### テストファイルの配置

```
src/tests/
├── sample.spec.ts      # サンプル
├── player.spec.ts      # プレイヤー関連
└── combat.spec.ts      # 戦闘関連
```

### テストの構造

```typescript
/// <reference types="@rbxts/testez/globals" />

export = () => {
  describe('calculateDamage', () => {
    it('基本ダメージを計算する', () => {
      const result = calculateDamage(100, 10);
      expect(result).to.equal(90);
    });

    it('HPが0未満にならない', () => {
      const result = calculateDamage(5, 100);
      expect(result).to.equal(0);
    });
  });
};
```

---

## 🔄 Git ワークフロー

### ブランチ

```
main        ← 本番リリース（保護ブランチ）
  ↑
develop     ← 開発統合（デフォルトブランチ）
  ↑
feature/xxx ← 機能開発
fix/xxx     ← バグ修正
```

### コミットメッセージ

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント変更
style: フォーマット変更（動作に影響なし）
refactor: リファクタリング
perf: パフォーマンス改善
test: テスト追加・修正
chore: ビルド・ツール変更
```

### PR テンプレート

```markdown
## 概要

何を変更したか

## 変更内容

- [ ] 機能A
- [ ] 機能B

## テスト方法

1. xxx を行う
2. yyy を確認

## スクリーンショット

（あれば）
```

---

## ⚠️ 注意事項

### やってはいけないこと

1. **main ブランチへの直接プッシュ**
2. **レビューなしでのマージ**
3. **ビルドが壊れた状態でのプッシュ**
4. **他人の担当フォルダの無断変更**

### 困ったときは

1. **コンフリクト** → まず `develop` を pull してマージ
2. **ビルドエラー** → `pnpm install` で依存関係を再インストール
3. **わからないこと** → Slack/Discord で質問
