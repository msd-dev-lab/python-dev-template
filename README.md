# Python Development Template

プロレベルの品質チェックが自動で行われるPython開発テンプレート。

## 特徴

- **全自動品質チェック** - コードを書くだけで品質が保証される
- **コピペで適用** - 新規プロジェクトにコピーするだけ
- **cc-sdd対応** - 仕様駆動開発ツールと組み合わせ可能

---

## 品質チェックの流れ

```
1. ローカル開発
   └─ pre-commit（コミット前に自動チェック）
        ├─ ruff check（Lint）
        ├─ ruff format（フォーマット）
        └─ mypy（型チェック）

2. git push
   └─ GitHub Actions（CI/CD）
        ├─ ruff check
        ├─ mypy
        └─ pytest（テスト実行）

3. Pull Request 作成
   └─ CodeRabbit（AIレビュー）※オプション
        ├─ コード品質チェック
        ├─ セキュリティ分析
        └─ 改善提案
```

**全て自動！手動でやることは「コードを書く」だけ。**

---

## クイックスタート

### 新規プロジェクトへの適用

```bash
# 1. テンプレートをコピー
cp -r python-dev-template/ my-new-project/
cd my-new-project/

# 2. プロジェクト名を変更（pyproject.toml）
# name = "your-project-name" を編集

# 3. 仮想環境を作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 4. 開発依存関係をインストール
pip install -e ".[dev]"

# 5. pre-commit をセットアップ
pre-commit install

# 6. 動作確認
pytest                      # テスト実行
ruff check src/ tests/      # Lint
mypy src/                   # 型チェック
```

### 既存プロジェクトへの適用

```bash
# 必要なファイルをコピー
cp python-dev-template/pyproject.toml your-project/
cp python-dev-template/.pre-commit-config.yaml your-project/
cp python-dev-template/.gitignore your-project/
cp python-dev-template/QUALITY.md your-project/
cp -r python-dev-template/.github your-project/
cp -r python-dev-template/tests your-project/

# pyproject.toml の name と dependencies を調整
# → 既存の requirements.txt から移行
```

---

## cc-sdd との統合

[cc-sdd](https://github.com/gotalab/cc-sdd)（仕様駆動開発ツール）と併用する場合：

### 方法1: QUALITY.md を steering に追加

```bash
# cc-sdd インストール後
cp QUALITY.md .kiro/steering/quality.md
```

これで `/kiro:spec-impl` 実行時に品質ルールも参照されます。

### 方法2: CLAUDE.md にリネーム

```bash
# cc-sdd を使わない場合
mv QUALITY.md CLAUDE.md
```

### 役割分担

| ツール | 役割 |
|--------|------|
| **cc-sdd** | 仕様駆動開発（要件→設計→タスク→実装） |
| **QUALITY.md** | コード品質ルール（Lint, Test, Type） |
| **pre-commit** | コミット前チェック |
| **GitHub Actions** | CI/CD |
| **CodeRabbit** | AIコードレビュー |

---

## CodeRabbit セットアップ（オプション）

GitHubリポジトリ作成後：

1. [coderabbit.ai](https://www.coderabbit.ai/) にアクセス
2. GitHubで認証
3. リポジトリを選択（**公開リポジトリは無料**）
4. Install & Authorize

以降、PRを作成すると自動でAIレビューが実行されます。

### カスタマイズ（.coderabbit.yaml）

```yaml
# .coderabbit.yaml
language: "ja"  # 日本語でレビュー
reviews:
  auto_review:
    enabled: true
```

---

## ディレクトリ構造

```
your-project/
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD
├── src/
│   └── __init__.py             # メインパッケージ
├── tests/
│   ├── __init__.py
│   ├── conftest.py             # 共有fixtures
│   └── test_example.py         # サンプルテスト
├── .gitignore
├── .pre-commit-config.yaml     # コミット前チェック
├── pyproject.toml              # 統一設定
├── QUALITY.md                  # 品質ルール（cc-sdd対応）
└── README.md
```

---

## 開発コマンド

```bash
# テスト
pytest                              # 全テスト
pytest -v                           # 詳細出力
pytest -m "not slow"                # 遅いテスト除外
pytest --cov                        # カバレッジ付き
pytest --cov --cov-report=html      # HTMLレポート

# Lint & Format
ruff check src/ tests/              # Lint
ruff check src/ tests/ --fix        # 自動修正
ruff format src/ tests/             # フォーマット

# 型チェック
mypy src/

# pre-commit
pre-commit run --all-files          # 全ファイルチェック
pre-commit autoupdate               # hooks更新
```

---

## カスタマイズ

### カバレッジ閾値を上げる

`pyproject.toml`:
```toml
[tool.coverage.report]
fail_under = 80  # 50 → 80
```

### mypy を strict に

`pyproject.toml`:
```toml
[tool.mypy]
strict = true
```

### 依存関係を追加

`pyproject.toml`:
```toml
[project]
dependencies = [
    "requests>=2.31.0",
    "python-dotenv>=1.0.0",
]
```

---

## FAQ

### Q: pre-commit でエラーが出る

```bash
# hooks を再インストール
pre-commit uninstall
pre-commit install

# キャッシュクリア
pre-commit clean
```

### Q: mypy でエラーが多すぎる

段階的に strict を有効化:
```toml
[tool.mypy]
disallow_untyped_defs = false  # まずは警告のみ
```

### Q: 既存コードに適用したい

1. まず `pyproject.toml` だけコピー
2. `ruff check --fix` で自動修正
3. 残りのエラーを手動修正
4. テストを段階的に追加

---

## ライセンス

MIT License - 自由に使ってください。
