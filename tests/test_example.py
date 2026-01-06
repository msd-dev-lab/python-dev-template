"""
Example Tests

テストの書き方の参考例です。
実際のプロジェクトでは、このファイルを削除して独自のテストを作成してください。

テストの命名規則:
    test_<機能名>_<条件>_<期待結果>
    例: test_add_positive_numbers_returns_sum

テストの構造:
    1. Arrange（準備）
    2. Act（実行）
    3. Assert（検証）
"""

import pytest

# ==============================================================================
# Basic Tests
# ==============================================================================


class TestBasicOperations:
    """基本的なテストの例."""

    def test_addition(self) -> None:
        """足し算のテスト."""
        # Arrange
        a, b = 2, 3

        # Act
        result = a + b

        # Assert
        assert result == 5

    def test_string_concatenation(self) -> None:
        """文字列結合のテスト."""
        assert "Hello" + " " + "World" == "Hello World"


# ==============================================================================
# Parameterized Tests
# ==============================================================================


class TestParameterized:
    """パラメータ化テストの例."""

    @pytest.mark.parametrize(
        ("input_value", "expected"),
        [
            (0, 0),
            (1, 1),
            (2, 4),
            (3, 9),
            (-2, 4),
        ],
    )
    def test_square(self, input_value: int, expected: int) -> None:
        """二乗計算のパラメータ化テスト."""
        assert input_value**2 == expected

    @pytest.mark.parametrize(
        ("text", "expected_length"),
        [
            ("", 0),
            ("a", 1),
            ("hello", 5),
            ("日本語", 3),
        ],
    )
    def test_string_length(self, text: str, expected_length: int) -> None:
        """文字列長のテスト."""
        assert len(text) == expected_length


# ==============================================================================
# Exception Tests
# ==============================================================================


class TestExceptions:
    """例外テストの例."""

    def test_division_by_zero_raises_error(self) -> None:
        """ゼロ除算でZeroDivisionErrorが発生する."""
        with pytest.raises(ZeroDivisionError):
            _ = 1 / 0

    def test_index_error_on_empty_list(self) -> None:
        """空リストへのアクセスでIndexErrorが発生する."""
        empty_list: list[int] = []
        with pytest.raises(IndexError):
            _ = empty_list[0]

    def test_key_error_with_message(self) -> None:
        """KeyErrorのメッセージを検証する."""
        data: dict[str, int] = {"a": 1}
        with pytest.raises(KeyError, match="b"):
            _ = data["b"]


# ==============================================================================
# Fixture Usage Tests
# ==============================================================================


class TestWithFixtures:
    """fixtureを使ったテストの例."""

    def test_with_sample_data(self, sample_data: dict) -> None:
        """sample_data fixtureを使ったテスト.

        conftest.pyで定義されたfixtureが自動注入されます。
        """
        assert sample_data["id"] == 1
        assert sample_data["name"] == "test"
        assert sample_data["active"] is True

    def test_with_temp_file(self, temp_file) -> None:
        """temp_file fixtureを使ったテスト."""
        assert temp_file.exists()
        assert temp_file.read_text() == "test content"


# ==============================================================================
# Marker Tests
# ==============================================================================


@pytest.mark.slow
class TestSlowOperations:
    """時間のかかるテスト.

    実行時に除外する場合: pytest -m "not slow"
    """

    def test_heavy_computation(self) -> None:
        """重い計算のテスト（例）."""
        result = sum(range(1000000))
        assert result == 499999500000


@pytest.mark.integration
class TestIntegration:
    """統合テスト.

    実行時に除外する場合: pytest -m "not integration"
    """

    def test_end_to_end_placeholder(self) -> None:
        """エンドツーエンドテストのプレースホルダー."""
        # 実際の統合テストをここに書く
        assert True
