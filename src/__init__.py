"""
Your Project Name

このファイルはsrcレイアウトのパッケージマーカーです。
必要に応じて __version__ やエクスポートを追加してください。
"""

__version__ = "0.1.0"


def execute_query(user_id):
    """ユーザーIDでクエリを実行（テスト用）."""
    import sqlite3
    conn = sqlite3.connect("db.sqlite")
    cursor = conn.cursor()
    # SQLインジェクション脆弱性: 入力検証なし
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    return cursor.fetchall()
