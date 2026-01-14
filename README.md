# Python Development Template

コードが読めなくても、プロレベルの品質が自動で担保されるPython開発テンプレート。

## これで何ができる？

```
あなた「〇〇作って」
    ↓
【cc-sdd】要件定義作成
    ↓
【codex-review-requirements】要件レビュー → ディープリサーチプロンプト生成
    ↓
【ディープリサーチ】ChatGPT等で調査 → 要件に反映
    ↓
【cc-sdd】設計 → タスク → 実装
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

**6重チェック + ディープリサーチ。コードを読む必要なし。全部自動。**

---

## 新規プロジェクトの作り方

### ステップ1: フォルダ作成＆テンプレートコピー

```bash
# プロジェクトフォルダを作る
mkdir my-project
cd my-project

# テンプレートをコピー（.git を除外）
rsync -av --exclude='.git' ~/Desktop/project/python-dev-template/ .
```

### ステップ2: セットアップ方法を選択 🚀

**2つのセットアップ方法があります：**

#### 方法A: フル版（cc-sdd + 全機能）

仕様駆動開発（cc-sdd）を使う場合はこちら。要件定義から実装までの完全なワークフローが使えます。

```bash
# 1. cc-sddをインストール
npx cc-sdd@latest --claude --lang ja

# 2. フルセットアップ実行
npx github:msd-dev-lab/python-dev-template/.setup-tool
```

このコマンドが自動的に：
- ✅ `.kiro/steering/` ディレクトリを作成
- ✅ QUALITY.md と REVIEW_LOG.md を `.kiro/steering/` に配置
- ✅ pyproject.toml のプロジェクト名を対話的に設定
- ✅ Python 仮想環境を作成（**uv venv** - 超高速）
- ✅ 依存関係をインストール（**uv pip** - 10-100倍高速）
- ✅ pre-commit をセットアップ
- ✅ Claude Code Skills を同期（codex-review, codex-review-requirements, gemini-research, agent-memory）

#### 方法B: Lite版（cc-sdd無し）

cc-sddを使わない場合はこちら。コード品質ツールと作業記憶機能のみ使えます。

```bash
# ライトセットアップ実行（cc-sdd不要）
npx github:msd-dev-lab/python-dev-template/scripts setup-lite.js
```

このコマンドが自動的に：
- ✅ pyproject.toml のプロジェクト名を対話的に設定
- ✅ Python 仮想環境を作成（**uv venv** - 超高速）
- ✅ 依存関係をインストール（**uv pip** - 10-100倍高速）
- ✅ pre-commit をセットアップ
- ✅ Claude Code Skills を同期（codex-review, gemini-research, agent-memory）

**どちらを選ぶべき？**
- **フル版**: 要件定義から実装まで全自動化したい → 大規模開発向け
- **Lite版**: 既存コードの品質向上とレビューだけで十分 → 小規模開発・個人開発向け

**注意:** npxがうまく動かない場合は、以下のコマンドでローカル実行：
```bash
# リポジトリをクローン
git clone https://github.com/msd-dev-lab/python-dev-template.git /tmp/python-template
cd /tmp/python-template/.setup-tool
npm install
node setup.js
```

### ステップ3: GitHubにアップ

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

### ステップ4: Claude Code Actions セットアップ

```bash
# Claude GitHub App とシークレットを自動設定
claude /install-github-app
```

→ リポジトリ名を聞かれる → **ステップ3で作成したリポジトリ名**（`msd-dev-lab/リポジトリ名`）を入力
→ ブラウザで認証
→ ワークフローファイル更新の確認 → 「1. Update workflow file」を選択
→ 完了（PRが自動作成されるのでマージ）

### ステップ5: プロジェクトメモリを作成（**フル版のみ**）

```bash
# Claude Code で以下を実行
/kiro:steering
```

このコマンドが：
- ✅ 既存の `quality.md` と `review-log.md` を参照しながら
- ✅ `product.md`, `tech.md`, `structure.md` を生成
- ✅ プロジェクト全体のコンテキストを確立

**Lite版の場合**: このステップはスキップしてください（kiro:steeringはcc-sdd必須）

**これでセットアップ完了！開発を開始できます。**

---

## 統合後のフォルダ構成

```
my-project/
├── .kiro/                      # cc-sdd（仕様駆動開発）
│   ├── settings/               # テンプレート・ルール
│   ├── specs/                  # 仕様書
│   └── steering/               # プロジェクトメモリ（全コマンドから参照）
│       ├── quality.md          # ← 品質ルール（要件定義・実装時に参照）
│       ├── review-log.md       # ← レビュー知見（頻出パターン）
│       ├── product.md          # プロジェクト情報（/kiro:steering で生成）
│       ├── tech.md             # 技術スタック（/kiro:steering で生成）
│       └── structure.md        # 構造パターン（/kiro:steering で生成）
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

### 1. 機能を作る（cc-sdd + 要件レビュー）

```bash
# ステップ1: 要件定義を作成
/kiro:spec-requirements "ユーザー認証機能"

# ステップ2: 要件をCodexレビュー（ok: true になるまで自動ループ）
/codex-review-requirements "ユーザー認証機能"
# → ディープリサーチプロンプトが自動生成される

# ステップ3: ChatGPT等でディープリサーチを実行
# → 技術調査、市場調査、ベストプラクティス、リスク分析
# → 調査結果を requirements.md に反映

# ステップ4: 設計 → タスク → 実装
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

## コード品質の向上（code-simplifier）

### code-simplifierとは

コードの明瞭性・一貫性・保守性を向上させる専門エージェント。機能を保持したまま、コードを簡潔で読みやすくします。

### いつ使うべきか

- **PRレビュー前**: コードを整理してレビューしやすくする
- **リファクタリング後**: 複雑になったコードを簡潔化
- **新規機能実装後**: コードの品質を最終チェック

### 使い方

```bash
# 現在のプロジェクトでcode-simplifierを実行
# ファイルパスを指定してコード簡潔化
npx claude code
# Claude Code内で以下を実行
/code-simplifier src/your_module.py
```

または、Claude Codeの会話内で：
```
scripts/setup.jsにcode-simplifierを実行して
```

### 主な機能

- **機能保持**: コードの動作は一切変更しない
- **明瞭性向上**: ネストの削減、変数名の改善、冗長性の除去
- **一貫性確保**: プロジェクトのコーディング規約に準拠
- **保守性向上**: 将来の拡張・デバッグを容易にする

**注意**: code-simplifierは最近変更されたコードに焦点を当てます。特定の範囲を指定したい場合は明示的に指示してください。

---

## 作業の記憶と再開（agent-memory）

### agent-memoryとは

セッションをまたいで作業内容を記憶・復元できる**プロジェクトローカルのメモリシステム**。調査結果、設計判断、進行中の作業を保存し、後から簡単に再開できます。

### いつ使うべきか

- **作業中断時**: 差し込み作業が入った時、調査を寝かせたい時
- **調査結果の保存**: 苦労して調べた技術情報、コードのゴッチャ
- **設計判断の記録**: アーキテクチャの決定とその理由
- **進行中の作業**: 未完了タスクの状態と次のステップ

### 使い方

```bash
# 記憶させる
「この調査結果を記憶して」
「今やっていることを覚えておいて」

# 思い出す
「○○について思い出して」
「前回の調査メモを見せて」

# 整理する
「メモリを整理して」
「古い記憶を掃除して」
```

### 保存場所

記憶は `.claude/skills/agent-memory/memories/` に保存されます（プロジェクトごとに独立）。

記憶ファイルはmarkdown形式で、frontmatterに要約が含まれるため、人間でも簡単に確認・編集できます：

```markdown
---
summary: "Issue #123 の調査結果と解決方針"
created: 2025-01-09
status: in-progress
---

# Issue #123 調査メモ

...
```

### 主な機能

- **永続性**: セッションをまたいで記憶が残る
- **検索可能**: ripgrepで高速検索（summary優先）
- **プロジェクト固有**: リポジトリごとに独立した記憶領域
- **人間が読める**: markdownファイルで直接確認・編集可能

**ヒント**: 重要な調査結果や設計判断は積極的に記憶させましょう。履歴を遡るより、記憶から引き出す方が圧倒的に速いです。

---

## 6重チェックの詳細

| 段階 | ツール | やること |
|------|--------|----------|
| 要件定義後 | codex-review-requirements | 要件の完全性・曖昧さ・実現可能性・EARS形式をレビュー → ディープリサーチプロンプト生成 |
| 実装中 | cc-sdd | 仕様通りに実装されているかチェック |
| コミット前 | codex-review | Codexがアーキテクチャ・セキュリティ・ロジックをレビュー |
| コミット時 | pre-commit | コード整形、Lint、型チェック |
| プッシュ後 | GitHub Actions | テスト実行（Python 3.10/3.11/3.12） |
| PR作成後 | Claude Code Actions | AIコードレビュー |

---

## codex-review-requirements の仕組み

```
/codex-review-requirements {feature_name} 実行
    ↓
requirements.md を読み込み
    ↓
Codexがレビュー（7つの観点）
  - 完全性: 必要な要件が網羅されているか
  - 実現可能性: 技術的に実装可能か
  - 曖昧さ: 解釈の余地がないか
  - EARS形式: 受入条件が正しく記載されているか
  - 優先度: Must/Should/Couldが適切か
  - 依存関係: 前提条件・制約が明確か
  - テスタビリティ: テスト可能な形式か
    ↓
問題あり？
  ├─ YES → Claude Codeが修正 → 再レビュー（ループ）
  └─ NO → ok: true → ディープリサーチプロンプト生成
```

**ディープリサーチプロンプトには以下が含まれる:**
- 技術調査（実装方法の比較、推奨アプローチ）
- 市場調査（競合分析、ユーザーニーズ）
- ベストプラクティス（業界標準、セキュリティ）
- リスク分析（技術的リスク、実装上の注意点）

ChatGPT Deep Research、Perplexity Pro、Claude Projects等で実行 → requirements.md更新

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

## setup-python-dev パッケージの公開（メンテナ向け）

`.setup-tool/` ディレクトリには自動セットアップツールが含まれています。

### npmに公開する手順

```bash
cd /Users/masudashinya/Desktop/project/python-dev-template/.setup-tool

# 依存関係をインストール
npm install

# npmにログイン（初回のみ）
npm login

# パッケージを公開
npm publish
```

公開後は `npx setup-python-dev` でどこからでも使えるようになります。

### ローカルでテストする

```bash
cd .setup-tool
npm install
node setup.js
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
