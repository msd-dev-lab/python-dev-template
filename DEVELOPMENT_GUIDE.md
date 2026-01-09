# 開発フローガイド

プロジェクトの品質を保証するための開発フロー。

## 品質保証ツール

### 1. cc-sdd（仕様駆動開発）
**役割**: 要件定義 → 設計 → タスク → 実装の流れを管理

**使用タイミング**: 新機能開発の開始時

```bash
/kiro:spec-requirements "機能名"  # 要件定義
/kiro:spec-design "機能名"        # 設計
/kiro:spec-tasks "機能名"         # タスク分解
/kiro:spec-impl "機能名"          # 実装
```

### 2. codex-review-requirements（要件レビュー）
**役割**: 要件定義の品質チェック + ディープリサーチプロンプト生成

**使用タイミング**: 要件定義作成後、設計前

```bash
/codex-review-requirements "機能名"
```

**チェック項目**:
- 完全性（必要な要件が網羅されているか）
- 実現可能性（技術的に実装可能か）
- 曖昧さ（解釈の余地がないか）
- EARS形式（受入条件が正しいか）
- 優先度（Must/Should/Couldが適切か）
- 依存関係（前提条件・制約が明確か）
- テスタビリティ（テスト可能か）

**出力**: ディープリサーチプロンプト
→ ChatGPT Deep Research、Perplexity Pro等で実行
→ 調査結果をrequirements.mdに反映

### 3. codex-review（コードレビュー）
**役割**: 実装コードの品質チェック（アーキテクチャ・セキュリティ・ロジック）

**使用タイミング**: コミット前（必須）

```bash
/codex-review
```

**動作**:
- 規模判定（small/medium/large）
- 問題検出 → Claude Codeが修正 → 再レビュー
- ok: trueになるまで最大5回ループ

### 4. code-simplifier（コード簡潔化）
**役割**: コードの明瞭性・一貫性・保守性を向上

**使用タイミング**:
- PRレビュー前（推奨）
- リファクタリング後
- 新規機能実装後

```bash
/code-simplifier src/your_module.py
```

または会話内で：
```
scripts/setup.pyにcode-simplifierを実行して
```

**効果**:
- 機能は一切変更しない
- ネストの削減、変数名の改善
- 冗長性の除去
- プロジェクト規約への準拠

### 5. gemini-research（情報調査）
**役割**: Web検索・技術調査

**使用タイミング**:
- 技術選定時
- 実装方法の調査
- ベストプラクティスの確認

```bash
/gemini-research "調査内容"
```

---

## 推奨開発フロー

### パターンA: 新機能開発（フルフロー）

```
1. 要件定義
   /kiro:spec-requirements "機能名"

2. 要件レビュー + リサーチ
   /codex-review-requirements "機能名"
   → ディープリサーチプロンプトでChatGPT等で調査
   → requirements.mdに反映

3. 設計 → タスク → 実装
   /kiro:spec-design "機能名"
   /kiro:spec-tasks "機能名"
   /kiro:spec-impl "機能名"

4. コード簡潔化
   /code-simplifier src/your_module.py

5. コードレビュー
   /codex-review  # ok: trueまでループ

6. コミット
   git add .
   git commit -m "feat: 機能名"
   # → pre-commitが自動実行

7. プッシュ → PR作成
   git push
   gh pr create --title "機能名" --body "説明"
   # → GitHub Actions + Claude Code Actions
```

### パターンB: バグ修正（簡易フロー）

```
1. 修正実装

2. コード簡潔化（必要に応じて）
   /code-simplifier src/fixed_module.py

3. コードレビュー
   /codex-review

4. コミット → プッシュ
   git add .
   git commit -m "fix: バグ説明"
   git push
```

### パターンC: リファクタリング

```
1. リファクタリング実装

2. コード簡潔化
   /code-simplifier src/refactored_module.py

3. コードレビュー
   /codex-review

4. コミット → プッシュ
```

---

## 品質チェックポイント

### ✅ コミット前チェックリスト

- [ ] `/codex-review`でok: trueを確認
- [ ] コードの複雑性が高い場合は`/code-simplifier`を実行
- [ ] テストが通ることを確認（`pytest -v`）
- [ ] 型チェックが通ることを確認（pre-commitで自動）

### ✅ PR作成前チェックリスト

- [ ] PRの目的が明確
- [ ] 変更内容が適切にコミットメッセージに記載
- [ ] 大きな変更の場合、設計ドキュメントを更新

### ✅ レビュー後の対応

- [ ] 指摘事項をREVIEW_LOG.mdに記録（3回以上出現 → QUALITY.mdに昇格）
- [ ] 同じ指摘が出ないようにQUALITY.mdを更新

---

## ツールの使い分け

| 段階 | ツール | 目的 |
|------|--------|------|
| 要件定義 | cc-sdd | 要件の構造化 |
| 要件レビュー | codex-review-requirements | 要件の完全性確認 + リサーチプロンプト生成 |
| 調査 | gemini-research / ChatGPT Deep Research | 技術調査・市場調査 |
| 設計・実装 | cc-sdd | 仕様通りの実装 |
| コード品質 | code-simplifier | コードの簡潔化・可読性向上 |
| コードレビュー | codex-review | セキュリティ・ロジック検証 |
| コミット時 | pre-commit | コード整形・Lint・型チェック |
| プッシュ後 | GitHub Actions | 自動テスト |
| PR時 | Claude Code Actions | AIレビュー |

---

## よくある質問

### Q: code-simplifierとcodex-reviewの違いは？

**code-simplifier**:
- コードの書き方を改善（可読性・保守性）
- 機能は変更しない
- リファクタリング的な役割

**codex-review**:
- ロジック・セキュリティ・設計をレビュー
- 機能的な問題を検出
- コードレビュー的な役割

→ 両方使うことで、「読みやすく、正しいコード」になる

### Q: codex-reviewがOKにならない場合は？

- 最大5回まで自動ループ
- 5回でもOKにならない場合、手動で確認
- blocking指摘は必ず修正
- advisory指摘は判断して対応

### Q: ディープリサーチは必須？

**Must機能**: 必須（技術選定、実装方法の検証が必要）
**Should機能**: 推奨（ベストプラクティス確認）
**Could機能**: オプション（時間があれば）

### Q: 既存コードにcode-simplifierを使える？

使えますが、明示的に範囲を指定してください：
```
src/legacy_module.pyにcode-simplifierを実行して
```

デフォルトでは最近変更されたコードのみが対象です。

---

## まとめ

品質保証の3つの柱：

1. **要件品質**: codex-review-requirements + ディープリサーチ
2. **コード品質**: code-simplifier + codex-review
3. **自動品質**: pre-commit + GitHub Actions + Claude Code Actions

全部使えば、プロレベルの品質が自動で担保されます。
