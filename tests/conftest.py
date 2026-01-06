"""
Pytest Configuration and Shared Fixtures

このファイルには全テストで共有するfixtureを定義します。
pytest は自動的にこのファイルを読み込みます。

使い方:
    テスト関数の引数にfixture名を指定するだけで自動注入されます。

    def test_example(sample_data):
        assert sample_data["name"] == "test"
"""

from collections.abc import Generator
from pathlib import Path
from typing import Any

import pytest

# ==============================================================================
# Configuration
# ==============================================================================


def pytest_configure(config: pytest.Config) -> None:
    """pytest設定のカスタマイズ."""
    # カスタムマーカーの登録
    config.addinivalue_line("markers", "slow: marks tests as slow")
    config.addinivalue_line("markers", "integration: integration tests")


# ==============================================================================
# Basic Fixtures
# ==============================================================================


@pytest.fixture
def sample_data() -> dict[str, Any]:
    """サンプルデータを提供するfixture.

    使用例:
        def test_something(sample_data):
            assert sample_data["id"] == 1
    """
    return {
        "id": 1,
        "name": "test",
        "active": True,
    }


@pytest.fixture
def temp_file(tmp_path: Path) -> Generator[Path, None, None]:
    """一時ファイルを作成するfixture.

    tmp_pathはpytest組み込みfixture（テスト終了後に自動クリーンアップ）

    使用例:
        def test_file_operation(temp_file):
            assert temp_file.exists()
    """
    file_path = tmp_path / "test_file.txt"
    file_path.write_text("test content")
    yield file_path
    # クリーンアップは tmp_path が自動で行う


# ==============================================================================
# Environment Fixtures
# ==============================================================================


@pytest.fixture
def mock_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """環境変数をモックするfixture.

    テスト中だけ環境変数を設定し、テスト終了後に自動で元に戻ります。

    使用例:
        def test_with_env(mock_env):
            # 環境変数が設定された状態でテスト
            assert os.getenv("TEST_VAR") == "test_value"
    """
    monkeypatch.setenv("TEST_VAR", "test_value")
    monkeypatch.setenv("DEBUG", "true")


# ==============================================================================
# Parametrized Fixtures
# ==============================================================================


@pytest.fixture(params=["json", "yaml", "toml"])
def file_format(request: pytest.FixtureRequest) -> str:
    """複数のファイル形式でテストを実行するfixture.

    このfixtureを使うと、同じテストが3回（json, yaml, toml）実行されます。

    使用例:
        def test_parser(file_format):
            # file_format は "json", "yaml", "toml" のいずれか
            assert file_format in ["json", "yaml", "toml"]
    """
    return str(request.param)
