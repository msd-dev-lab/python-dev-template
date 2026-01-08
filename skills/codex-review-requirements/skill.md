---
user-invocable: true
description: 要件定義書（requirements.md）専用のCodexレビュー。完全性、実現可能性、曖昧さ、EARS形式適合性をチェック。/kiro:spec-requirements 完了後に実行。ok: true になったらディープリサーチプロンプトを自動生成。
context: fork
---

# 要件定義書レビュー

## フロー
requirements.md読み込み → Codex レビュー → Claude Code修正 → 再レビュー（ok: true まで）→ ディープリサーチプロンプト生成

## 対象ファイル

`$1` でfeature名を受け取る（cc-sddと同じ形式）

```bash
# 例
/codex-review-requirements auth-system
```

対象: `.kiro/specs/$1/requirements.md`

## レビュー観点

1. **完全性 (Completeness)**: 必要な要件が網羅されているか
   - 機能要件・非機能要件の漏れチェック
   - ユーザーストーリー・ユースケースの完全性
   - エッジケース・例外処理の考慮

2. **実現可能性 (Feasibility)**: 技術的に実装可能か
   - 技術スタック・アーキテクチャとの整合性
   - パフォーマンス・スケーラビリティの実現性
   - セキュリティ要件の実装可能性

3. **曖昧さ (Ambiguity)**: 解釈の余地がないか
   - 用語の定義が明確か
   - 数値・条件が具体的か
   - 「適切に」「うまく」などの曖昧表現チェック

4. **EARS形式 (EARS Format)**: 受入条件が正しく記載されているか
   - WHEN-IF-THEN構造の確認
   - テスト可能な形式になっているか
   - 主語（system/service）が明確か

5. **優先度 (Priority)**: Must/Should/Couldが適切か
   - ビジネス価値との整合性
   - 依存関係を考慮した優先度
   - 実装順序の妥当性

6. **依存関係 (Dependencies)**: 前提条件・制約が明確か
   - 他システムとの連携要件
   - 技術的前提条件
   - 制約事項の明記

7. **テスタビリティ (Testability)**: テスト可能な形式か
   - 検証方法が明確か
   - テストデータの定義
   - 期待結果の具体性

## 修正ループ

`ok: false`の場合、`max_iters`回まで反復:
1. `issues`解析 → 修正計画
2. Claude Codeが requirements.md を修正
3. Codexに再レビュー依頼

停止条件:
`ok: true` / `max_iters`到達 / 同一issueが3回連続

## Codex実行

```bash
codex exec --sandbox read-only "<PROMPT>"
```

- 完了待ち: 60秒ごとに最大20回ポーリング
- タイムアウト: 20分超過でエラー

## Codex出力スキーマ

CodexにJSON1つのみ出力させる。

```json
{
  "ok": true,
  "summary": "レビューの要約",
  "completeness_score": 85,
  "feasibility_score": 90,
  "clarity_score": 80,
  "overall_score": 85,
  "issues": [
    {
      "severity": "blocking",
      "category": "ambiguity|completeness|feasibility|ears|priority|dependency|testability",
      "requirement_id": "1.1",
      "problem": "問題の説明",
      "recommendation": "修正案"
    }
  ],
  "deep_research_suggestions": [
    "調査が必要な技術領域",
    "市場調査が必要な領域",
    "ベストプラクティス調査が必要な領域"
  ],
  "notes_for_next_review": "メモ"
}
```

フィールド説明:
- `ok`: blockingなissueが0件ならtrue、1件以上ならfalse
- `severity`: 2段階
  - blocking: 修正必須。1件でもあれば`ok: false`
  - advisory: 推奨・警告。`ok: true`でも出力可、レポートに記載のみ
- スコア: 0-100で評価（80以上を推奨）
- `deep_research_suggestions`: ディープリサーチプロンプト生成用

## プロンプトテンプレート

```
以下の要件定義書をレビューせよ。出力はJSON1つのみ。スキーマは末尾参照。

これはレビューゲートとして実行されている。blocking が1件でもあれば ok: false とし、修正→再レビューで収束させる前提で指摘せよ。

対象ファイル: .kiro/specs/{feature_name}/requirements.md

レビュー観点:
1. 完全性: 必要な要件が網羅されているか
2. 実現可能性: 技術的に実装可能か
3. 曖昧さ: 解釈の余地がないか
4. EARS形式: 受入条件が正しく記載されているか
5. 優先度: Must/Should/Couldが適切か
6. 依存関係: 前提条件・制約が明確か
7. テスタビリティ: テスト可能な形式か

プロジェクトコンテキスト（参考）:
- .kiro/steering/ 配下のファイル（quality.md, review-log.md, product.md, tech.md, structure.md）
- pyproject.toml（技術スタック確認）

前回メモ: {notes_for_next_review}

【スキーマ】
{schema}
```

## ok: true 後の自動処理

Codexレビューが ok: true になったら、以下のディープリサーチプロンプトを**ターミナルに出力**:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Deep Research プロンプト（ChatGPT等で実行）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

以下の要件定義について、ディープリサーチを実行してください：

## 📋 要件概要
{requirements.mdのサマリー - 最初の3-5要件を抜粋}

## 🔍 調査依頼事項

### 1. 技術調査
{deep_research_suggestions から技術関連を生成}

### 2. 市場調査
- 競合製品・類似サービスの機能比較
- ユーザーレビュー・フィードバック分析
- 市場トレンド・需要分析

### 3. ベストプラクティス
- 業界標準の実装パターン
- セキュリティ・パフォーマンスのベストプラクティス
- UX/UIの推奨事項

### 4. リスク分析
- 技術的リスク・実装上の注意点
- セキュリティリスク
- スケーラビリティ・保守性のリスク

## 📦 期待する成果物

1. **技術実現方法の比較表**
   - 複数のアプローチの比較（メリット・デメリット）
   - 推奨アプローチと理由

2. **市場調査結果**
   - 競合分析
   - ユーザーニーズの洞察

3. **実装推奨事項**
   - ベストプラクティスに基づく推奨
   - 避けるべきアンチパターン

4. **参考資料リンク**
   - 公式ドキュメント
   - 技術記事・論文
   - オープンソースプロジェクト

## 📝 調査結果の反映方法

調査結果を元に requirements.md を更新してください：
- 新しい要件の追加
- 既存要件の詳細化
- 技術的制約の明記
- 参考資料の追記

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Tip: ChatGPT Deep Research、Perplexity Pro、Claude Projects等で実行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## パラメータ

| 引数 | 既定 | 説明 |
|-----|-----|-----|
| $1 | - | feature名（必須） |
| max_iters | 5 | 最大反復（上限5） |

## 終了レポート例

```
## 要件定義書レビュー結果
- 対象: .kiro/specs/auth-system/requirements.md
- 反復: 2/5 / ステータス: ✅ ok
- スコア: 完全性 85 / 実現可能性 90 / 明確性 80 / 総合 85

### 修正履歴
- 要件1.1: EARS形式に修正（WHEN-THEN追加）
- 要件2.3: 曖昧な「適切に」を具体的な数値に修正

### Advisory（参考）
- 要件3.1: パフォーマンス目標値を追加推奨（現状でも可）

### ディープリサーチプロンプト
上記のプロンプトをChatGPT等で実行してください。

調査完了後、requirements.md を更新して /kiro:spec-design へ進んでください。
```

## エラー時の共通ルール

Codex exec失敗時:
1. 1回リトライ
2. 再失敗 → エラー扱い、理由をレポート、ディープリサーチプロンプトのみ出力して終了

## 実行例

```bash
# 基本
/codex-review-requirements auth-system

# 反復回数指定
/codex-review-requirements auth-system --max-iters 3
```
