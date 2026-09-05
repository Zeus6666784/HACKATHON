import { RAGDocument } from "../models/RAGDocument";
import { env } from "../config/env";

export const ragService = {
  async ingestDocument(title: string, content: string, category: string, metadata: any = {}) {
    // Simple chunking: break content into paragraphs or fixed sizes
    // For a professional system, we'd use a more robust RecursiveCharacterTextSplitter
    const chunks = content.split("\\n\\n").filter(chunk => chunk.trim().length > 0);

    const documents = chunks.map(chunk => ({
      title,
      content: chunk,
      category,
      metadata
    }));

    return await RAGDocument.insertMany(documents);
  },

  async retrieveRAG(query: string, limit = 3) {
    // Using MongoDB $text search for retrieval (simulating vector search for simplicity)
    // ponytail: Simple $text search; upgrade to Atlas Vector Search if scale increases.
    const results = await RAGDocument.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } }).limit(limit);

    return results.map(doc => doc.content).join("\\n\\n");
  }
};
