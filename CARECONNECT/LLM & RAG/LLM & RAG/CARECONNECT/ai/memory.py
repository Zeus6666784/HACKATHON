import re
import sqlite3
from datetime import datetime, timezone


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def detect_language(text):
    if re.search(r"[\u0900-\u097f]", text):
        marathi_markers = ("आहे", "मला", "दुखत", "काय", "रुग्ण")
        return "mr" if any(marker in text for marker in marathi_markers) else "hi"
    return "en"


class MemoryStore:
    """Application-owned persistence boundary; replace this adapter for cloud SQL later."""

    def __init__(self, connection_factory):
        self.connection_factory = connection_factory

    def initialize(self):
        connection = self.connection_factory()
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL,
                created_at TEXT NOT NULL, updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY, conversation_id INTEGER NOT NULL REFERENCES conversations(id),
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant')), content TEXT NOT NULL,
                language TEXT NOT NULL, metadata TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY, user_id TEXT NOT NULL, conversation_id INTEGER NOT NULL,
                content TEXT NOT NULL, memory_type TEXT NOT NULL, importance INTEGER NOT NULL DEFAULT 50,
                source_message_id INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1,
                valid_until TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
                UNIQUE(user_id, memory_type, content)
            );
            CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id, active, importance DESC);
            CREATE TABLE IF NOT EXISTS conversation_summaries (
                conversation_id INTEGER PRIMARY KEY, summary TEXT NOT NULL,
                covered_through TEXT NOT NULL, updated_at TEXT NOT NULL
            );
        """)
        connection.commit()
        connection.close()

    def create_conversation(self, user_id="anonymous", title="New clinical conversation"):
        now = utc_now()
        connection = self.connection_factory()
        cursor = connection.execute("INSERT INTO conversations(user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?)", (user_id, title, now, now))
        connection.commit()
        conversation_id = cursor.lastrowid
        connection.close()
        return conversation_id

    def list_conversations(self, user_id="anonymous"):
        connection = self.connection_factory()
        rows = connection.execute("SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC", (user_id,)).fetchall()
        connection.close()
        return [dict(row) for row in rows]

    def conversation_exists(self, conversation_id, user_id="anonymous"):
        connection = self.connection_factory()
        row = connection.execute("SELECT 1 FROM conversations WHERE id = ? AND user_id = ?", (conversation_id, user_id)).fetchone()
        connection.close()
        return row is not None

    def add_message(self, conversation_id, role, content, metadata=None):
        now = utc_now()
        connection = self.connection_factory()
        cursor = connection.execute("INSERT INTO messages(conversation_id, role, content, language, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?)", (conversation_id, role, content, detect_language(content), __import__("json").dumps(metadata or {}), now))
        connection.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conversation_id))
        connection.commit()
        message_id = cursor.lastrowid
        connection.close()
        return message_id

    def recent_messages(self, conversation_id, limit=12):
        connection = self.connection_factory()
        rows = connection.execute("SELECT id, role, content, language, metadata, created_at FROM messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?", (conversation_id, limit)).fetchall()
        connection.close()
        return [dict(row) for row in reversed(rows)]

    def extract_explicit_memories(self, user_id, conversation_id, message_id, content):
        candidates = []
        patterns = (
            ("case_context", r"\bcase\s*(?:id|number)?\s*[:#]?\s*([A-Za-z0-9-]+)\b", "Case context: {}"),
            ("patient_fact", r"\b(?:patient|my)\s+(?:age is|is)\s+([0-9]{1,3})\s*(?:years?|yrs?)\b", "Patient age explicitly provided: {} years"),
            ("user_preference", r"\b(?:please|respond|reply)\s+(?:in|using)\s+(English|Hindi|Marathi|हिंदी|मराठी)\b", "Response language preference: {}"),
        )
        for memory_type, pattern, template in patterns:
            for match in re.finditer(pattern, content, re.I):
                candidates.append((memory_type, template.format(match.group(1)), 70))
        connection = self.connection_factory()
        for memory_type, memory_content, importance in candidates:
            connection.execute("UPDATE memories SET active = 0, updated_at = ? WHERE user_id = ? AND memory_type = ? AND active = 1 AND content <> ?", (utc_now(), user_id, memory_type, memory_content))
            existing = connection.execute("SELECT id FROM memories WHERE user_id = ? AND memory_type = ? AND active = 1 AND content = ?", (user_id, memory_type, memory_content)).fetchone()
            if existing:
                connection.execute("UPDATE memories SET updated_at = ?, source_message_id = ?, conversation_id = ? WHERE id = ?", (utc_now(), message_id, conversation_id, existing["id"]))
                continue
            connection.execute("INSERT OR IGNORE INTO memories(user_id, conversation_id, content, memory_type, importance, source_message_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", (user_id, conversation_id, memory_content, memory_type, importance, message_id, utc_now(), utc_now()))
        connection.commit()
        connection.close()
        return [content for _, content, _ in candidates]

    def relevant_memories(self, user_id, query, limit=6):
        terms = [term.lower() for term in re.findall(r"[\w']+", query) if len(term) > 2]
        connection = self.connection_factory()
        rows = connection.execute("SELECT id, content, memory_type, importance, conversation_id, updated_at FROM memories WHERE user_id = ? AND active = 1 ORDER BY importance DESC, updated_at DESC LIMIT ?", (user_id, limit * 3)).fetchall()
        connection.close()
        if not terms:
            return [dict(row) for row in rows[:limit]]
        ranked = sorted(rows, key=lambda row: (sum(term in row["content"].lower() for term in terms), row["importance"]), reverse=True)
        return [dict(row) for row in ranked[:limit] if any(term in row["content"].lower() for term in terms)] or [dict(row) for row in rows[:limit]]

    def upsert_summary(self, conversation_id, summary, covered_through):
        connection = self.connection_factory()
        connection.execute("INSERT INTO conversation_summaries(conversation_id, summary, covered_through, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(conversation_id) DO UPDATE SET summary = excluded.summary, covered_through = excluded.covered_through, updated_at = excluded.updated_at", (conversation_id, summary, covered_through, utc_now()))
        connection.commit()
        connection.close()

    def summary(self, conversation_id):
        connection = self.connection_factory()
        row = connection.execute("SELECT summary, covered_through FROM conversation_summaries WHERE conversation_id = ?", (conversation_id,)).fetchone()
        connection.close()
        return dict(row) if row else None