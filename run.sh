#!/bin/bash

# プロジェクトの絶対パス
PROJECT_DIR="/Users/makaurure/projects/curifo_Custom_IaC"

# 引数でパスが渡された場合はそのディレクトリへ、無指定の場合はプロジェクトルートへ移動
if [ -n "$1" ]; then
    TARGET_DIR="$1"
else
    TARGET_DIR="$PROJECT_DIR"
fi

echo "Moving to directory: $TARGET_DIR"
cd "$TARGET_DIR" || { echo "Error: Directory not found"; exit 1; }

# CLIアプリの起動
npm run main
