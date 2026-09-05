import { RAGDocument } from "../models/RAGDocument";

function chunkText(content: string, size = 1200, overlap = 150) {
  const words = content.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let start = 0; start < words.length; start += Math.max(1, size - overlap)) {
    const chunk = words.slice(start, start + size).join(" ");
    if (chunk) chunks.push(chunk);
  }
  return chunks;
}

export async function ingestRAGDocument(source: string, content: string, approved = false) {
  if (!source?.trim() || !content?.trim()) throw new Error("source and content are required");
  return RAGDocument.create({ source: source.trim(), approved, chunks: chunkText(content).map((chunk) => ({ content: chunk })) });
}

export async function retrieveRAG(query: string, limit = 4) {
  if (!query.trim()) return [];
  return RAGDocument.find({ approved: true, $text: { $search: query } }, { source: 1, "chunks.$": 1, score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } }).limit(Math.min(limit, 10)).lean();
}