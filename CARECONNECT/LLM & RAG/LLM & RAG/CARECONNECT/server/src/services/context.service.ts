import { Patient } from "../models/Patient";
import { Referral } from "../models/Referral";
import { AIConversation } from "../models/AIConversation";
import { buildMemoryContext } from "./memory.service";
import { retrieveRAG } from "./rag.service";

export async function buildAIContext(userId: string, conversationId: string, query: string, patientId?: string, referralId?: string) {
  const conversation = await AIConversation.findOne({ _id: conversationId, userId }).select("messages summary patientId referralId").lean();
  if (!conversation) throw new Error("Conversation not found");
  const recent = conversation.messages.slice(-10).filter((message) => !(message.role === "user" && message.content === query)).map((message) => ({ role: message.role, content: message.content }));
  const [memories, documents, patient, referral] = await Promise.all([
    buildMemoryContext(userId, query),
    retrieveRAG(query),
    patientId ? Patient.findById(patientId).select("patientId name age gender location").lean() : Promise.resolve(null),
    referralId ? Referral.findById(referralId).select("referralId status priority careLevel patientId fromFacilityId toFacilityId").lean() : Promise.resolve(null)
  ]);
  return {
    recent,
    memories: memories.map((memory) => ({ content: memory.content })),
    documents: documents.flatMap((document) => document.chunks?.map((chunk) => ({ source: document.source, content: chunk.content })) ?? []),
    summary: conversation.summary,
    structured: { patient, referral }
  };
}