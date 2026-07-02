"""
SQLite persistence layer.

Stores user accounts, chats, and messages so that conversations can be saved
and retrieved later. Uses only the Python standard library (sqlite3) — no
external database server required, which suits a self-hosted prototype.
"""
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "app.db")


@contextmanager
def get_conn():
    """Yield a SQLite connection with row access by column name."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    """Create tables if they do not exist. Called once at startup."""
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                username      TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt          TEXT NOT NULL,
                created_at    TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tokens (
                token      TEXT PRIMARY KEY,
                user_id    INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS chats (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id    INTEGER NOT NULL,
                title      TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS messages (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id    INTEGER NOT NULL,
                role       TEXT NOT NULL,          -- 'user' or 'assistant'
                content    TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_chats_user ON chats(user_id);
            CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
            """
        )


def now() -> str:
    return datetime.now().isoformat()


# --------------------------------------------------------------------------- #
# Users
# --------------------------------------------------------------------------- #
def create_user(username: str, password_hash: str, salt: str) -> int:
    with get_conn() as conn:
        cur = conn.execute(
            "INSERT INTO users (username, password_hash, salt, created_at) VALUES (?, ?, ?, ?)",
            (username, password_hash, salt, now()),
        )
        return cur.lastrowid


def get_user_by_username(username: str):
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM users WHERE username = ?", (username,)
        ).fetchone()


def get_user_by_id(user_id: int):
    with get_conn() as conn:
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


# --------------------------------------------------------------------------- #
# Tokens
# --------------------------------------------------------------------------- #
def save_token(token: str, user_id: int) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO tokens (token, user_id, created_at) VALUES (?, ?, ?)",
            (token, user_id, now()),
        )


def get_user_id_for_token(token: str):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT user_id FROM tokens WHERE token = ?", (token,)
        ).fetchone()
        return row["user_id"] if row else None


def delete_token(token: str) -> None:
    with get_conn() as conn:
        conn.execute("DELETE FROM tokens WHERE token = ?", (token,))


# --------------------------------------------------------------------------- #
# Chats
# --------------------------------------------------------------------------- #
def create_chat(user_id: int, title: str = "New chat") -> dict:
    with get_conn() as conn:
        ts = now()
        cur = conn.execute(
            "INSERT INTO chats (user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (user_id, title, ts, ts),
        )
        return {"id": cur.lastrowid, "title": title, "created_at": ts, "updated_at": ts}


def list_chats(user_id: int) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, title, created_at, updated_at FROM chats "
            "WHERE user_id = ? ORDER BY updated_at DESC",
            (user_id,),
        ).fetchall()
        return [dict(r) for r in rows]


def get_chat(chat_id: int, user_id: int):
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM chats WHERE id = ? AND user_id = ?", (chat_id, user_id)
        ).fetchone()


def rename_chat(chat_id: int, title: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "UPDATE chats SET title = ?, updated_at = ? WHERE id = ?",
            (title, now(), chat_id),
        )


def touch_chat(chat_id: int) -> None:
    with get_conn() as conn:
        conn.execute("UPDATE chats SET updated_at = ? WHERE id = ?", (now(), chat_id))


def delete_chat(chat_id: int, user_id: int) -> None:
    with get_conn() as conn:
        conn.execute(
            "DELETE FROM chats WHERE id = ? AND user_id = ?", (chat_id, user_id)
        )


# --------------------------------------------------------------------------- #
# Messages
# --------------------------------------------------------------------------- #
def add_message(chat_id: int, role: str, content: str) -> dict:
    with get_conn() as conn:
        ts = now()
        cur = conn.execute(
            "INSERT INTO messages (chat_id, role, content, created_at) VALUES (?, ?, ?, ?)",
            (chat_id, role, content, ts),
        )
        conn.execute("UPDATE chats SET updated_at = ? WHERE id = ?", (ts, chat_id))
        return {"id": cur.lastrowid, "role": role, "content": content, "created_at": ts}


def list_messages(chat_id: int) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, role, content, created_at FROM messages "
            "WHERE chat_id = ? ORDER BY id ASC",
            (chat_id,),
        ).fetchall()
        return [dict(r) for r in rows]
