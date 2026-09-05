import { Schema, model } from "mongoose";

const ragDocumentSchema = new Schema({
  source: { type: String, required: true },
  approved: { type: Boolean, default: false, index: true },
  chunks: [{ content: { type: String, required: true } }]
}, { timestamps: true });

ragDocumentSchema.index({ source: 1 });
ragDocumentSchema.index({ "chunks.content": "text" });

export const RAGDocument = model("RAGDocument", ragDocumentSchema);