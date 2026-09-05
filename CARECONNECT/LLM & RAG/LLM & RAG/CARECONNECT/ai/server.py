import json
import os
import re
import sqlite3
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from memory import MemoryStore


ROOT = Path(__file__).parent
STATIC = ROOT / "static"
DB_PATH = Path(os.getenv("APP_DB_PATH", os.getenv("RAG_DB_PATH", ROOT / "app.sqlite3")))
MAX_TEXT = 6000
ALLOWED_PRIORITY = {"HIGH", "MEDIUM", "LOW"}
ALLOWED_CARE = {"PHC", "DISTRICT", "TERTIARY"}
TOKEN_RE = re.compile(r"[\w']+", re.UNICODE)


def db_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY, source TEXT NOT NULL, content TEXT NOT NULL)")
    connection.execute("CREATE VIRTUAL TABLE IF NOT EXISTS chunks USING fts5(source, content)")
    return connection


MEMORY_STORE = MemoryStore(db_connection)
MEMORY_STORE.initialize()


def chunk_text(content, size=1200, overlap=150):
    words = content.split()
    chunks = []
    start = 0
    while start < len(words):
        chunk = " ".join(words[start:start + size])
        if chunk:
            chunks.append(chunk)
        start += max(1, size - overlap)
    return chunks


def ingest_document(source, content):
    if not isinstance(source, str) or not source.strip() or not isinstance(content, str) or not content.strip():
        raise ValueError("source and content are required")
    connection = db_connection()
    with connection:
        document_id = connection.execute("INSERT INTO documents(source, content) VALUES (?, ?)", (source.strip(), content)).lastrowid
        connection.executemany("INSERT INTO chunks(source, content) VALUES (?, ?)", [(source.strip(), chunk) for chunk in chunk_text(content)])
    connection.close()
    return document_id


def retrieve(query, limit=4):
    if not query.strip():
        return []
    terms = [term for term in TOKEN_RE.findall(query.lower()) if len(term) > 1]
    if not terms:
        return []
    match = " OR ".join(f'"{term.replace(chr(34), chr(34) * 2)}"' for term in terms)
    connection = db_connection()
    rows = connection.execute("SELECT source, content, bm25(chunks) AS score FROM chunks WHERE chunks MATCH ? ORDER BY score LIMIT ?", (match, limit)).fetchall()
    connection.close()
    return [{"source": row["source"], "content": row["content"], "score": round(float(row["score"]), 4)} for row in rows]


def fallback(text):
    danger_terms = ("unconscious", "not breathing", "severe bleeding", "chest pain", "convulsion", "seizure", "stroke", "सुन्न", "बेशुद्ध", "झटके", "छाती में दर्द", "बेशुद्ध", "बेशुद्धी", "फिट्स", "छातीत दुखणे")
    high = any(term in text.lower() for term in danger_terms)
    return {
        "priority": "HIGH" if high else "MEDIUM",
        "suggestedCareLevel": "TERTIARY" if high else "DISTRICT",
        "relevant_services": ["Emergency assessment" if high else "Clinical assessment"],
        "reasoning": "Deterministic safety fallback used because the language model was unavailable or returned an unsafe response.",
        "recommended_next_action": "Seek emergency help now and contact local emergency services." if high else "Arrange prompt assessment by a qualified clinician.",
        "caution": "This is decision support, not a diagnosis. A clinician must make the final decision."
    }


def validate_result(result):
    fields = ("priority", "suggested_care_level", "relevant_services", "reasoning", "recommended_next_action", "caution")
    if not isinstance(result, dict) or any(field not in result for field in fields):
        if "suggestedCareLevel" in result and "suggested_care_level" not in result:
            result["suggested_care_level"] = result["suggestedCareLevel"]
        else:
            raise ValueError("model output is missing required fields")
    if result["priority"] not in ALLOWED_PRIORITY or result["suggested_care_level"] not in ALLOWED_CARE:
        raise ValueError("model output contains an invalid enum")
    if not isinstance(result["relevant_services"], list) or not all(isinstance(item, str) for item in result["relevant_services"]):
        raise ValueError("relevant_services must be a string list")
    for field in fields[3:]:
        if not isinstance(result[field], str) or not result[field].strip():
            raise ValueError(f"{field} must be a non-empty string")
    unsafe = re.compile(r"\b(?:you have|diagnosed with|i diagnose|prescrib(?:e|ed|ing)|dosage|guarantee(?:d|s)?|confirmed disease)\b", re.I)
    if any(unsafe.search(result[field]) for field in fields[3:]):
        raise ValueError("model output contains prohibited clinical certainty or prescribing language")
    return result


def build_context(user_id, conversation_id, message):
    recent = MEMORY_STORE.recent_messages(conversation_id, limit=10)
    memories = MEMORY_STORE.relevant_memories(user_id, message, limit=6)
    summary = MEMORY_STORE.summary(conversation_id)
    documents = retrieve(message, limit=4)
    return {"recent_messages": recent, "memories": memories, "summary": summary, "documents": documents}


def provider_result(message, context):
    endpoint = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1/chat/completions").rstrip("/")
    api_key = os.getenv("LLM_API_KEY")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    if not api_key:
        raise RuntimeError("LLM_API_KEY is not configured")
    system = """You are a multilingual healthcare triage decision-support assistant for rural hospitals. Understand English, Hindi, Marathi, and mixed language. Preserve the user's language when practical. Never diagnose, prescribe, guarantee outcomes, invent patient facts, or override clinicians. Ask for missing information in reasoning/recommended_next_action. Return ONLY valid JSON with exactly these fields: priority (HIGH|MEDIUM|LOW), suggested_care_level (PHC|DISTRICT|TERTIARY), relevant_services (array of strings), reasoning (string), recommended_next_action (string), caution (string). The clinician remains responsible for final decisions."""
    if context["memories"]:
        system += "\nApplication memory contains only explicitly stored user/application facts. Do not treat it as new clinical evidence:\n" + "\n".join(f"- {item['content']}" for item in context["memories"])
    if context["summary"]:
        system += "\nOlder conversation summary:\n" + context["summary"]["summary"]
    if context["documents"]:
        system += "\nApproved retrieved reference context follows. Use it only when relevant and do not claim retrieval when it is absent:\n" + "\n\n".join(f"[{item['source']}] {item['content']}" for item in context["documents"])
    messages = [{"role": "system", "content": system}]
    recent = context["recent_messages"]
    if recent and recent[-1]["role"] == "user" and recent[-1]["content"] == message:
        recent = recent[:-1]
    messages.extend({"role": item["role"], "content": item["content"]} for item in recent)
    messages.append({"role": "user", "content": message})
    payload = json.dumps({"model": model, "temperature": 0.1, "response_format": {"type": "json_object"}, "messages": messages}).encode()
    request = urllib.request.Request(endpoint, data=payload, headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(request, timeout=float(os.getenv("LLM_TIMEOUT_SECONDS", "25"))) as response:
        body = json.loads(response.read().decode())
    content = body["choices"][0]["message"]["content"]
    if isinstance(content, list):
        content = "".join(part.get("text", "") for part in content if isinstance(part, dict))
    return validate_result(json.loads(content))


def assess(payload):
    message = payload.get("message") if isinstance(payload, dict) else None
    if not isinstance(message, str) or not message.strip() or len(message) > MAX_TEXT:
        raise ValueError(f"message is required and must be at most {MAX_TEXT} characters")
    
    user_id = payload.get("user_id", "anonymous")
    conversation_id = payload.get("conversation_id", "global")
    
    try:
        # 1. Build Context (RAG + Memory)
        context = build_context(user_id, conversation_id, message)
        
        # 2. Get AI result
        result = provider_result(message, context)
        
        # 3. Map to final API contract
        return {
            "priority": result["priority"],
            "suggestedCareLevel": result.get("suggestedCareLevel", result.get("suggested_care_level")),
            "reasoning": result["reasoning"],
            "caution": result["caution"],
            "relevant_services": result.get("relevant_services", []),
            "recommended_next_action": result.get("recommended_next_action", "Consult a clinician.")
        }
    except Exception as e:
        # 4. Compulsory Fallback
        return fallback(message)
