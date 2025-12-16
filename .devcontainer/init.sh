#!/bin/bash
# Tutorial MMO World - Dev Container 初期化スクリプト

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

STEPS=5

show_progress() {
  local current=$1
  local total=$2
  local bar=""
  for i in $(seq 1 $total); do
    if [ $i -lt $current ]; then
      bar="${bar}${GREEN}■${NC}"
    elif [ $i -eq $current ]; then
      bar="${bar}${YELLOW}■${NC}"
    else
      bar="${bar}${CYAN}□${NC}"
    fi
  done
  echo -e "${bar}  (${current}/${total})"
}

step_echo() {
  local step=$1
  local msg=$2
  echo -e "\n${BLUE}========================================${NC}"
  show_progress $step $STEPS
  echo -e "${YELLOW}${msg}${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

# エラーハンドリング
set -e
trap 'echo -e "${RED}エラーが発生しました。セットアップを中断します。${NC}"' ERR

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║   Tutorial MMO World - Dev Container      ║"
echo "  ║        Roblox Development Setup           ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${NC}"

step_echo 1 "Git 設定をセットアップしています..."
git config --global --add safe.directory /workspace
git config --global core.autocrlf input
git config --global core.eol lf
echo -e "${GREEN}Git 設定完了${NC}"

step_echo 2 "依存関係をインストールしています..."
cd /workspace
# node_modules ディレクトリの権限を修正
sudo chown -R node:node /workspace/node_modules 2>/dev/null || true
sudo mkdir -p /workspace/node_modules 2>/dev/null || true
sudo chown -R node:node /workspace/node_modules 2>/dev/null || true
pnpm install --frozen-lockfile
echo -e "${GREEN}依存関係インストール完了${NC}"

step_echo 3 "Aftman ツールをインストールしています..."
cd /workspace
# Aftman で Rojo, StyLua, Selene をインストール
aftman install --no-trust-check
echo -e "${GREEN}Aftman ツールインストール完了${NC}"

# ツールのバージョン確認
echo -e "${CYAN}インストールされたツール:${NC}"
echo -n "  Rojo: " && rojo --version 2>/dev/null || echo "not found"
echo -n "  StyLua: " && stylua --version 2>/dev/null || echo "not found"
echo -n "  Selene: " && selene --version 2>/dev/null || echo "not found"

step_echo 4 "TypeScript をビルドしています..."
cd /workspace
pnpm build
echo -e "${GREEN}ビルド完了${NC}"

step_echo 5 "セットアップが完了しました！"

echo -e "${GREEN}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║         セットアップ完了！                ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}次のステップ:${NC}"
echo -e "  1. ${YELLOW}pnpm dev:game${NC}でRojoサーバーを起動"
echo -e "  2. Roblox Studioで${YELLOW}Rojo Connect${NC} (ポート: 34872)"
echo ""
echo -e "${CYAN}利用可能なコマンド:${NC}"
echo "  pnpm dev:game      - 開発サーバー起動"
echo "  pnpm build         - TypeScript ビルド"
echo "  pnpm lint          - ESLint チェック"
echo "  pnpm format        - Prettier フォーマット"
echo "  pnpm format:lua    - StyLua フォーマット"
echo ""
