# Python Development Template

コードが読めなくても、プロレベルの品質が自動で担保されるPython開発テンプレート。

## これで何ができる？

```
あなた「〇〇作って」
    ↓
Claude Code（実装）
    ↓
自動チェック（ruff, mypy, pytest）
    ↓
AIレビュー（CodeRabbit）
    ↓
自動マージ
    ↓
プロ品質のコード完成
```

**コードを読む必要なし。全部自動。**

---

## 新規プロジェクトの作り方

### ステップ1: フォルダ作成＆テンプレートコピー

```bash
# プロジェクトフォルダを作る
mkdir my-project
cd my-project

# テンプレートをコピー
cp -r ~/Desktop/project/python-dev-template/* .
```

### ステップ2: cc-sdd をセットアップ

```bash
# 仕様駆動開発ツールをインストール
npx cc-sdd@latest --claude --lang ja
```

### ステップ3: 品質ルールを統合

```bash
# QUALITY.md を cc-sdd に統合（これ重要！）
cp QUALITY.md .kiro/steering/quality.md
```

### ステップ4: Python環境セットアップ

```bash
# 仮想環境を作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係をインストール
pip install -e ".[dev]"

# pre-commit をセットアップ
pre-commit install
```

### ステップ5: GitHubにアップ

```bash
# Git初期化
git init
git add .
git commit -m "Initial setup"

# GitHubリポジトリ作成＆プッシュ
gh repo create msd-dev-lab/my-project --public --source=. --push
```

### ステップ6: pyproject.toml のプロジェクト名を変更

```toml
[project]
name = "my-project"  # ← ここを変更
```

---

## 統合後のフォルダ構成

```
my-project/
├── .kiro/                      # cc-sdd（仕様駆動開発）
│   ├── settings/               # テンプレート
│   ├── specs/                  # 仕様書
│   └── steering/
│       ├── project.md          # プロジェクト情報
│       └── quality.md          # ← 品質ルール（統合したやつ）
│
├── .github/workflows/ci.yml    # GitHub Actions（自動テスト）
├── src/                        # ソースコード
├── tests/                      # テストコード
├── pyproject.toml              # 設定ファイル
├── .pre-commit-config.yaml     # コミット前チェック
└── QUALITY.md                  # 品質ルール（元ファイル）
```

---

## 開発の流れ

### 1. 機能を作る

```bash
# cc-sdd で仕様から実装まで自動化
/kiro:spec-quick "ユーザー認証機能" --auto
```

### 2. コミット＆プッシュ

```bash
git add .
git commit -m "ユーザー認証機能を追加"
git push
```

### 3. PR作成

```bash
gh pr create --title "ユーザー認証機能" --body "認証機能を追加"
```

### 4. 自動でチェック＆マージ

- GitHub Actions が自動でテスト実行
- CodeRabbit が自動でAIレビュー
- 全部通ったら自動マージ

**PRがなくなれば完了！**

---

## 自動でやってくれること

| ツール | タイミング | やること |
|--------|-----------|----------|
| pre-commit | コミット時 | コード整形、Lint、型チェック |
| GitHub Actions | プッシュ時 | テスト実行（Python 3.10/3.11/3.12） |
| CodeRabbit | PR作成時 | AIコードレビュー |
| 自動マージ | 全チェック通過後 | PRを自動でマージ |

---

## CodeRabbit セットアップ（初回のみ）

1. https://github.com/marketplace/coderabbit にアクセス
2. 「Install it for free」をクリック
3. Organization（msd-dev-lab）を選択
4. 「All repositories」を選択
5. 「Install & Authorize」をクリック

**一度やれば、今後のリポジトリは自動で対象になる。**

---

## 困ったとき

### pre-commit でエラーが出る

```bash
pre-commit uninstall
pre-commit install
pre-commit clean
```

### テストが通らない

```bash
# ローカルでテスト実行して確認
pytest -v
```

### 型エラーが多すぎる

`pyproject.toml` で緩める：
```toml
[tool.mypy]
disallow_untyped_defs = false
```

---

## ライセンス

MIT License - 自由に使ってください。
