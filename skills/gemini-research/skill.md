---
name: gemini-research
description: This skill should be used when the user asks to "search with gemini", "web research", "check reddit", "gemini 調査", "リサーチして", "最新情報を調べて", or when WebFetch is blocked. Uses Gemini CLI for web searches and research on sites that Claude Code WebFetch cannot access (Reddit, social media, etc) or for deep research requiring multiple sources.
version: 1.0.0
user-invocable: true
context: fork
---

# Gemini Research

## 概要

Gemini CLIを経由してWeb検索・リサーチを行う。Claude CodeのWebFetchがブロックされるサイトや、より深いリサーチが必要な場合に使用。

## 使用タイミング

- WebFetchでアクセス拒否されたサイト（Reddit、一部SNS等）
- 最新の技術情報・ドキュメント検索
- 複数ソースからの情報収集が必要なリサーチ
- 日本語での詳細な調査

## 実行方法

### シンプル検索

単発の検索クエリの場合:

```bash
gemini "WebSearch: $ARGUMENTS"
```

### 詳細リサーチ（tmux使用）

複数の質問や対話が必要な場合:

```bash
# セッション作成・Gemini起動
tmux new-session -d -s gemini-research
tmux send-keys -t gemini-research 'gemini' Enter
sleep 3

# クエリ送信
tmux send-keys -t gemini-research "$ARGUMENTS" Enter
sleep 10

# 結果取得
tmux capture-pane -t gemini-research -p -S -100

# 追加質問（必要に応じて繰り返し）
# tmux send-keys -t gemini-research "追加の質問" Enter
# sleep 10
# tmux capture-pane -t gemini-research -p -S -100

# 終了
tmux send-keys -t gemini-research '/quit' Enter
tmux kill-session -t gemini-research
```

## プロンプト例

### 検索系
- `WebSearch: Claude Code skills best practices 2025`
- `WebSearch: Reddit Claude Code 評判`

### リサーチ系
```
以下について調査し、要点をまとめてください:
[調査テーマ]
```

### サイト指定
```
Redditで Claude Code の評判を検索し、主要な意見をまとめてください
```

## 出力フォーマット

```markdown
## リサーチ結果: [テーマ]

### 概要
[1-2文の要約]

### 主要な発見
- [発見1]
- [発見2]

### ソース
- [ソース1]: [要点]
```

## エラー対処

| エラー | 対処 |
|--------|------|
| `gemini: command not found` | `npm install -g @google/gemini-cli` |
| 認証エラー | `gemini` 起動しGoogleで再認証 |
| tmuxセッション重複 | `tmux kill-session -t gemini-research` |

## 前提条件

```bash
# Gemini CLI
npm install -g @google/gemini-cli
gemini  # 初回認証（1日1000回無料）

# tmux（詳細リサーチ用）
brew install tmux  # macOS
```

## 使用例

```
/gemini-research Next.js 15 変更点
/gemini-research Redditで Claude Code の評判
```
