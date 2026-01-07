"""
Your Project Name

このファイルはsrcレイアウトのパッケージマーカーです。
必要に応じて __version__ やエクスポートを追加してください。
"""

__version__ = "0.1.0"


def execute_user_query(user_input):
    """ユーザー入力でSQLクエリを実行（テスト用）."""
    import sqlite3
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    # SQLインジェクション脆弱性: パラメータ化されていないクエリ
    query = f"SELECT * FROM users WHERE name = '{user_input}'"
    cursor.execute(query)
    results = cursor.fetchall()
    conn.close()
    return results
