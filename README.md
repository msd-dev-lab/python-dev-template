# Python Development Template

コードが読めなくても、プロレベルの品質が自動で担保されるPython開発テンプレート。

## これで何ができる？

```
あなた「〇〇作って」
    ↓
【cc-sdd】仕様 → 設計 → タスク → 実装
    ↓
【codex-review】Codexレビュー → 修正 → 再レビュー（OKまでループ）
    ↓
【pre-commit】コード品質チェック
    ↓
【GitHub Actions】テスト実行
    ↓
【Claude Code Actions】AIレビュー
    ↓
自動マージ
    ↓
プロ品質のコード完成
```

**5重チェック。コードを読む必要なし。全部自動。**

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

### ステップ2: Python環境セットアップ

```bash
# 仮想環境を作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係をインストール
pip install -e ".[dev]"

# pre-commit をセットアップ
pre-commit install
```

### ステップ3: cc-sdd をセットアップ

```bash
# 仕様駆動開発ツールをインストール
npx cc-sdd@latest --claude --lang ja
```

### ステップ4: 品質ルールを統合

```bash
# QUALITY.md を cc-sdd に統合（これ重要！）
cp QUALITY.md .kiro/steering/quality.md
```

### ステップ5: pyproject.toml のプロジェクト名を変更

```toml
[project]
name = "my-project"  # ← ここを変更
```

### ステップ6: GitHubにアップ

```bash
# Git初期化
git init
git add .
git commit -m "Initial setup"

# リポジトリ作成（名前は開発内容に合わせて決める）
gh repo create msd-dev-lab/リポジトリ名 --public

# リモート追加＆プッシュ
git remote add origin https://github.com/msd-dev-lab/リポジトリ名.git
git push -u origin main
```

### ステップ7: Claude Code Actions セットアップ

```bash
# Claude GitHub App とシークレットを自動設定
claude /install-github-app
```

→ リポジトリ名を聞かれる → **ステップ6で作成したリポジトリ名**（`msd-dev-lab/リポジトリ名`）を入力
→ ブラウザで認証
→ ワークフローファイル更新の確認 → 「1. Update workflow file」を選択
→ 完了（PRが自動作成されるのでマージ）

**これで Claude Code Actions が使えるようになります。**

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
├── .github/workflows/
│   ├── ci.yml                  # GitHub Actions（自動テスト）
│   ├── claude.yml              # Claude Code Actions（@claudeメンション）
│   └── claude-code-review.yml  # Claude Code Actions（PR自動レビュー）
├── src/                        # ソースコード
├── tests/                      # テストコード
├── pyproject.toml              # 設定ファイル
├── .pre-commit-config.yaml     # コミット前チェック
├── QUALITY.md                  # 品質ルール（元ファイル）
└── REVIEW_LOG.md               # レビュー知見の蓄積（テンプレートのみ）
```

---

## 開発の流れ

### 1. 機能を作る（cc-sdd）

```bash
# 仕様から実装まで
/kiro:spec-requirements "ユーザー認証機能"
/kiro:spec-design "ユーザー認証機能"
/kiro:spec-tasks "ユーザー認証機能"
/kiro:spec-impl "ユーザー認証機能"
```

### 2. Codexレビュー（コミット前）

```bash
# Codexがレビュー → 問題あれば修正 → OKになるまでループ
/codex-review
```

### 3. コミット＆プッシュ

```bash
git add .
git commit -m "ユーザー認証機能を追加"
git push
```

### 4. PR作成

```bash
gh pr create --title "ユーザー認証機能" --body "認証機能を追加"
```

### 5. 自動でチェック＆マージ

- GitHub Actions が自動でテスト実行
- Claude Code Actions が自動でAIレビュー
- 全部通ったら自動マージ

**PRがなくなれば完了！**

---

## 5重チェックの詳細

| 段階 | ツール | やること |
|------|--------|----------|
| 実装中 | cc-sdd | 仕様通りに実装されているかチェック |
| コミット前 | codex-review | Codexがアーキテクチャ・セキュリティ・ロジックをレビュー |
| コミット時 | pre-commit | コード整形、Lint、型チェック |
| プッシュ後 | GitHub Actions | テスト実行（Python 3.10/3.11/3.12） |
| PR作成後 | Claude Code Actions | AIコードレビュー |

---

## codex-review の仕組み

```
/codex-review 実行
    ↓
規模判定（small / medium / large）
    ↓
Codexがレビュー（read-only）
    ↓
問題あり？
  ├─ YES → Claude Codeが修正 → 再レビュー（ループ）
  └─ NO → 完了（ok: true）
```

- **blocking**: 修正必須。1件でもあればループ継続
- **advisory**: 推奨・警告。レポートに記載のみ

OKになるまで最大5回ループ。品質が担保されてからコミットできる。

---

## Claude Code Actions セットアップ

### 初回のみ（Organization 全体）

1. https://github.com/apps/claude にアクセス
2. 「Install」をクリック
3. Organization（msd-dev-lab）を選択
4. 「All repositories」を選択
5. 「Install & Authorize」をクリック

### 新規リポジトリごとに必要

シークレットはリポジトリ単位なので、新規プロジェクト作成時に実行：

```bash
claude /install-github-app
```

→ リポジトリ名を入力 → ブラウザで認証 → 自動でシークレット設定

**注意:** Organization secrets は無料プランでは使えないため、各リポジトリで実行が必要。

### レビュー知見の蓄積

レビューで得られた知見は以下のサイクルで蓄積：

```
プロジェクトでレビュー指摘を受ける
    ↓
テンプレートの REVIEW_LOG.md に追記
    ↓
3回以上出現したパターン
    ↓
QUALITY.md に昇格（ルール化）
    ↓
新プロジェクトは学習済みルールで開始
    ↓
レビュー指摘が減る
```

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
