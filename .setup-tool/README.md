# setup-python-dev

Python開発テンプレートの自動セットアップツール。

## 機能

このツールは以下を自動で実行します：

1. **`.kiro/steering/` ディレクトリ作成**
2. **品質ルールファイルのコピー**
   - `QUALITY.md` → `.kiro/steering/quality.md`
   - `REVIEW_LOG.md` → `.kiro/steering/review-log.md`
3. **pyproject.toml のプロジェクト名設定**（対話的に入力）
4. **Python 仮想環境作成**（`venv`）
5. **依存関係インストール**（`pip install -e ".[dev]"`）
6. **pre-commit セットアップ**
7. **Claude Code Skills 同期**
   - `codex-review`
   - `codex-review-requirements`
   - `gemini-research`

## 使い方

新規プロジェクトのセットアップ時に実行：

```bash
npx setup-python-dev
```

または、このツールを公開せずにローカルで使う場合：

```bash
cd /path/to/python-dev-template/.setup-tool
npm install
node setup.js
```

## 公開方法（npm）

npmに公開する場合：

```bash
cd /path/to/python-dev-template/.setup-tool
npm login
npm publish
```

公開後は以下のコマンドで使えます：

```bash
npx setup-python-dev
```

## 開発

依存関係のインストール：

```bash
npm install
```

ローカルテスト：

```bash
node setup.js
```

## ライセンス

MIT
