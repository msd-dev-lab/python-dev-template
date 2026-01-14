# {{PROJECT_NAME}}

プロジェクトの説明をここに記載

## セットアップ

```bash
# 仮想環境の作成と依存関係のインストール
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
```

## 開発

```bash
# Lint
ruff check src tests

# Format
ruff format src tests

# 型チェック
mypy src

# テスト
pytest

# カバレッジ付きテスト
pytest --cov=src --cov-report=html
```

## プロジェクト構成

```
.
├── src/                 # ソースコード
├── tests/               # テストコード
├── .kiro/steering/      # 品質ルール
├── pyproject.toml       # プロジェクト設定
└── README.md
```
