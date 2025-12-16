# Roblox 開発用 Dev Container
# Node.js 20 + pnpm + Aftman (Rojo, StyLua, Selene)

FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm

# 必要なパッケージのインストール
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install --no-install-recommends -y \
    unzip \
    curl \
    git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# pnpm のインストール
RUN npm install -g pnpm@9.0.0 && \
    echo 'store-dir=/home/node/.local/share/pnpm/store/.pnpm-store' >> /home/node/.npmrc && \
    echo 'update-notifier=false' >> /home/node/.npmrc

# Aftman のインストール（Roblox ツールマネージャー）
USER node
RUN curl -sSfL https://github.com/LPGhatguy/aftman/releases/download/v0.3.0/aftman-0.3.0-linux-x86_64.zip -o /tmp/aftman.zip && \
    unzip /tmp/aftman.zip -d /tmp && \
    mkdir -p /home/node/.aftman/bin && \
    mv /tmp/aftman /home/node/.aftman/bin/ && \
    chmod +x /home/node/.aftman/bin/aftman && \
    rm -rf /tmp/aftman.zip

# PATH に Aftman を追加
ENV PATH="/home/node/.aftman/bin:${PATH}"

# Aftman を初期化
RUN /home/node/.aftman/bin/aftman self-install

USER root

# 初期化スクリプトをコピー
COPY init.sh /usr/local/bin/init.sh
RUN chmod +x /usr/local/bin/init.sh

USER node
