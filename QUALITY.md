# Code Quality Rules

コード品質を維持するためのルール集です。
Claude Code / Cursor / Copilot などのAIアシスタントが参照します。

## 使い方

### 単独使用（cc-sddなし）
このファイルを `CLAUDE.md` にリネームしてプロジェクトルートに配置:
```bash
cp QUALITY.md CLAUDE.md
```

### cc-sddと併用
`.kiro/steering/` にコピーして統合:
```bash
cp QUALITY.md .kiro/steering/quality.md
```

---

## 開発コマンド

```bash
# テスト実行
pytest                              # 全テスト
pytest -m "not slow"                # 遅いテスト除外
pytest --cov                        # カバレッジ付き
pytest --cov --cov-report=html      # HTMLレポート生成

# 静的解析
ruff check src/ tests/              # Lint
ruff check src/ tests/ --fix        # 自動修正
ruff format src/ tests/             # フォーマット
mypy src/                           # 型チェック

# pre-commit
pre-commit install                  # hooks インストール
pre-commit run --all-files          # 全ファイルチェック
```

---

## 品質基準（MUST）

### コード変更時のチェックリスト

1. **Lint**: `ruff check src/ tests/` がパスすること
2. **Format**: `ruff format --check src/ tests/` がパスすること
3. **Type**: `mypy src/` がパスすること
4. **Test**: `pytest` がパスすること

**全てパスしてからコミット！**

### 新機能追加時

```
1. テストを先に書く（TDD）
   └─ tests/test_*.py に失敗するテストを追加

2. 実装する
   └─ テストがパスするまでコードを書く

3. リファクタリング
   └─ テストがパスしたままコードを整理

4. 品質チェック
   └─ ruff, mypy, pytest 全てパス
```

### バグ修正時

```
1. バグを再現するテストを書く
   └─ このテストは失敗するはず

2. テストが失敗することを確認

3. バグを修正

4. テストがパスすることを確認
   └─ 他のテストも壊れていないこと
```

---

## コーディング規約

### 型ヒント

```python
# Good: 型ヒントあり
def process(data: dict[str, Any]) -> list[str]:
    ...

# Bad: 型ヒントなし
def process(data):
    ...
```

### docstring

```python
def calculate(value: int) -> int:
    """値を計算して返す.

    Args:
        value: 入力値

    Returns:
        計算結果

    Raises:
        ValueError: 値が負の場合
    """
```

### 例外処理

```python
# Good: 具体的な例外
try:
    result = api_call()
except requests.RequestException as e:
    logger.error(f"API error: {e}")
    raise

# Bad: 広すぎる例外
try:
    result = api_call()
except Exception:
    pass  # 何が起きたかわからない
```

### インポート順序（ruff が自動整列）

```python
# 1. 標準ライブラリ
import os
import sys
from pathlib import Path

# 2. サードパーティ
import requests
from dotenv import load_dotenv

# 3. ローカル
from src.config import Settings
from src.utils import helper
```

---

## 禁止事項

### 絶対禁止

- [ ] テストなしの機能追加
- [ ] `# type: ignore` の乱用（正当な理由がある場合のみ）
- [ ] `# noqa` の乱用
- [ ] `print()` デバッグの残存（`logger` を使う）
- [ ] ハードコードされたシークレット
- [ ] `except Exception: pass`（例外の握りつぶし）

### 避けるべき

- [ ] グローバル変数の使用
- [ ] 1関数200行超え
- [ ] 循環インポート
- [ ] マジックナンバー（定数化する）

---

## テスト規約

### 命名規則

```python
# パターン: test_<機能>_<条件>_<期待結果>
def test_user_login_with_valid_credentials_returns_token():
    ...

def test_user_login_with_invalid_password_raises_error():
    ...
```

### 構造（AAA パターン）

```python
def test_add_positive_numbers():
    # Arrange（準備）
    a, b = 2, 3

    # Act（実行）
    result = add(a, b)

    # Assert（検証）
    assert result == 5
```

### カバレッジ目標

| フェーズ | 目標 |
|---------|------|
| 初期 | 50% |
| 成熟 | 80% |
| 重要機能 | 90%+ |

---

## セキュリティ規約

### 入力検証

```python
# 外部入力は必ずバリデーション
def process_user_input(data: str) -> str:
    if not data or len(data) > 1000:
        raise ValueError("Invalid input")
    return sanitize(data)
```

### シークレット管理

```python
# Good: 環境変数から取得
api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("API_KEY not set")

# Bad: ハードコード
api_key = "sk-1234567890"  # 絶対禁止！
```

### Bandit ルール

Ruff の `S` ルール（flake8-bandit）でセキュリティチェック:
- S101: assert使用（テスト以外では警告）
- S105: ハードコードされたパスワード
- S106: ハードコードされたパスワード引数
- S107: ハードコードされた一時ディレクトリ

---

## CI/CD との連携

### GitHub Actions

Push/PR時に自動実行:
1. `ruff check` - Lint
2. `ruff format --check` - フォーマット確認
3. `mypy` - 型チェック
4. `pytest` - テスト

### CodeRabbit（オプション）

PR作成時にAIレビュー:
1. コード品質チェック
2. セキュリティ分析
3. 改善提案

---

## cc-sdd 開発中のルール（MUST）

### 開発中：ローカルコミットのみ（pushしない）

```bash
# タスク1完了
git add .
git commit -m "タスク1: 概要"
# ← pushしない！

# タスク2完了
git add .
git commit -m "タスク2: 概要"
# ← pushしない！
```

**pushするとCodeRabbitが来てマージされてしまう。全タスク完了までローカルにとどめる。**

### 全タスク完了後：push & PR

```bash
# 1. Codexレビュー（OKまでループ）
/codex-review

# 2. push
git push

# 3. PR作成
gh pr create --title "機能名" --body "概要"

# 4. マージ後にローカル更新
git pull
```

**このフローを省略しないこと。**

---

## 参考リンク

- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [Mypy Documentation](https://mypy.readthedocs.io/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Python Type Hints Cheat Sheet](https://mypy.readthedocs.io/en/stable/cheat_sheet_py3.html)
