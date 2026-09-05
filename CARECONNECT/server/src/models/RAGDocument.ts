import { Schema, model } from "mongoose";

export interface IRAGDocument {
  title: string;
  content: string;
  category: string;
  metadata: Record<string, any>;
}

const ragDocumentSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: true });

// Text index for efficient retrieval of clinical guidelines
ragDocumentSchema.index({ content: "text", title: "text" });

export const RAGDocument = model("RAGDocument", ragDocumentSchema);
