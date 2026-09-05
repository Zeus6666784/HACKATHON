# Rural Clinical Referral Bridge AI prototype

This prototype separates four application-owned concerns: a replaceable cloud-compatible LLM provider, persistent conversation/memory storage, document-only RAG, and an orchestration/context builder. It uses an OpenAI-compatible chat completion endpoint when `LLM_API_KEY` is configured and returns the documented deterministic safety fallback when the provider is unavailable or output validation fails.

## Run

```powershell
$env:LLM_API_KEY = "your-server-side-key"
$env:LLM_BASE_URL = "https://api.openai.com/v1/chat/completions"
$env:LLM_MODEL = "gpt-4o-mini"
$env:APP_DB_PATH = "app.sqlite3"
python server.py
```

Open `http://localhost:8000`. No API key is sent to the browser. Without a key, the UI and API still run using the explicit safety fallback.

## API

- `POST /api/v1/triage/assess`: `{ "message": string, "conversation_id": number, "user_id": string }`; omit `conversation_id` to create one
- `POST /api/v1/conversations`: create a persistent conversation
- `GET /api/v1/conversations`: list conversations for `X-User-Id` (defaults to `anonymous`)
- `GET /api/v1/conversations/{id}`: reload persisted messages
- `POST /api/v1/rag/ingest`: `{ "source": string, "content": string }`
- `POST /api/v1/rag/retrieve`: `{ "query": string, "limit": number }`
- `GET /api/health`

RAG accepts approved text or Markdown reference material, chunks it into SQLite FTS5, and exposes the retrieved source/content so integration tests can verify context delivery. Structured triage output is never stored in RAG. Conversations and explicit user-provided facts are stored separately in the application database; current facts supersede older active facts without deleting history. The `MemoryStore` connection boundary is the replacement point for a cloud SQL implementation.