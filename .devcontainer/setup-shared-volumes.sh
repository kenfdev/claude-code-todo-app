#!/bin/bash

# 共有volumesを作成するスクリプト（冪等）
# このスクリプトは何度実行しても安全です
# どのプロジェクトから実行しても大丈夫です

set -e  # エラー時に停止

echo "共有volumesを設定しています..."

# 共有volumesのリスト
VOLUMES=(
    "claude-code-bashhistory"
    "claude-code-config"
    "gh-config"
)

# 各volumeを作成（既に存在する場合はスキップ）
for volume in "${VOLUMES[@]}"; do
    if docker volume inspect "$volume" >/dev/null 2>&1; then
        echo "✓ $volume は既に存在します"
    else
        echo "✓ $volume を作成しました"
        docker volume create "$volume"
    fi
done

echo ""
echo "すべての共有volumesが準備できました！"
echo ""
echo "使用方法："
echo "1. 各プロジェクトの .devcontainer/docker-compose.yml で"
echo "   volumes:"
echo "     claude-code-bashhistory:"
echo "       external: true"
echo "     claude-code-config:"
echo "       external: true"
echo "     gh-config:"
echo "       external: true"
echo "   を設定してください"
echo ""
echo "2. これで複数のプロジェクト間で設定や履歴が共有されます" 