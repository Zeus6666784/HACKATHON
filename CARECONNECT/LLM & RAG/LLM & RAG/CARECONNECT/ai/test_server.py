import json
import os
import tempfile
import unittest
import urllib.request

import server


class ServerTests(unittest.TestCase):
    def setUp(self):
        self.database = tempfile.NamedTemporaryFile(delete=False)
        self.database.close()
        os.environ["RAG_DB_PATH"] = self.database.name
        server.DB_PATH = server.Path(self.database.name)
        server.MEMORY_STORE.initialize()

    def tearDown(self):
        os.unlink(self.database.name)

    def test_fallback_is_valid_and_detects_danger_sign(self):
        self.assertEqual(server.validate_result(server.fallback("fever"))["priority"], "MEDIUM")
        self.assertEqual(server.validate_result(server.fallback("patient is unconscious"))["priority"], "HIGH")

    def test_rag_ingest_and_retrieve(self):
        server.ingest_document("protocol.md", "Severe chest pain requires immediate emergency assessment.")
        results = server.retrieve("chest pain")
        self.assertEqual(results[0]["source"], "protocol.md")

    def test_assess_without_provider_uses_fallback(self):
        os.environ.pop("LLM_API_KEY", None)
        response = server.assess({"message": "मुझे बुखार है", "history": []})
        self.assertTrue(response["used_fallback"])
        self.assertIn(response["result"]["priority"], server.ALLOWED_PRIORITY)

    def test_conversation_and_explicit_memory_survive_new_store_connection(self):
        conversation_id = server.MEMORY_STORE.create_conversation("user-1")
        response = server.assess({"conversation_id": conversation_id, "user_id": "user-1", "message": "Patient age is 42 years. Case #ABC-7."})
        self.assertEqual(response["conversation_id"], conversation_id)
        self.assertEqual(len(server.MEMORY_STORE.recent_messages(conversation_id)), 2)
        memories = server.MEMORY_STORE.relevant_memories("user-1", "patient case")
        self.assertEqual(len(memories), 2)
        server.MEMORY_STORE = server.MemoryStore(server.db_connection)
        server.MEMORY_STORE.initialize()
        self.assertEqual(len(server.MEMORY_STORE.recent_messages(conversation_id)), 2)
        self.assertEqual(len(server.MEMORY_STORE.relevant_memories("user-1", "patient case")), 2)

    def test_changed_explicit_fact_replaces_active_value(self):
        conversation_id = server.MEMORY_STORE.create_conversation("user-2")
        server.assess({"conversation_id": conversation_id, "user_id": "user-2", "message": "Patient age is 42 years."})
        server.assess({"conversation_id": conversation_id, "user_id": "user-2", "message": "Patient age is 43 years."})
        active = server.MEMORY_STORE.relevant_memories("user-2", "patient age")
        self.assertEqual([item["content"] for item in active if item["memory_type"] == "patient_fact"], ["Patient age explicitly provided: 43 years"])


if __name__ == "__main__":
    unittest.main()