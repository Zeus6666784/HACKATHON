import { Types } from "mongoose";
import { AIConversation } from "../models/AIConversation";
import { AIMemory } from "../models/AIMemory";
import { detectLanguage } from "./language.service";

export async function createConversation(userId: string, patientId?: string, referralId?: string) {
  return AIConversation.create({ userId, patientId, referralId, title: "Clinical conversation" });
}

export async function listConversations(userId: string) {
  return AIConversation.find({ userId }).select("title patientId referralId createdAt updatedAt").sort({ updatedAt: -1 }).lean();
}

export async function getConversation(userId: string, conversationId: string) {
  return AIConversation.findOne({ _id: conversationId, userId }).lean();
}

export async function appendMessage(conversationId: string, role: "user" | "assistant", content: string, metadata = {}) {
  const messageId = new Types.ObjectId();
  await AIConversation.updateOne({ _id: conversationId }, { $push: { messages: { _id: messageId, role, content, language: detectLanguage(content), metadata, createdAt: new Date() } } });
  return messageId;
}

export async function buildMemoryContext(userId: string, query: string, limit = 6) {
  const memories = await AIMemory.find({ userId, active: true, $text: { $search: query } }).sort({ importance: -1, updatedAt: -1 }).limit(limit).lean();
  return memories.length ? memories : AIMemory.find({ userId, active: true }).sort({ importance: -1, updatedAt: -1 }).limit(limit).lean();
}

export async function extractExplicitMemories(userId: string, conversationId: string, messageId: Types.ObjectId, content: string, patientId?: string, referralId?: string) {
  const candidates: Array<{ type: "STRUCTURED"; content: string; importance: number }> = [];
  const age = content.match(/\bpatient\s+(?:age is|is)\s+(\d{1,3})\s*(?:years?|yrs?)\b/i);
  const caseId = content.match(/\bcase\s*(?:id|number)?\s*[:#]?\s*([A-Za-z0-9-]+)\b/i);
  if (age) candidates.push({ type: "STRUCTURED", content: `Patient age explicitly provided: ${age[1]} years`, importance: 70 });
  if (caseId) candidates.push({ type: "STRUCTURED", content: `Case context explicitly provided: ${caseId[1]}`, importance: 70 });

  for (const candidate of candidates) {
    await AIMemory.updateMany({ userId, patientId: patientId ?? null, referralId: referralId ?? null, type: candidate.type, active: true, content: { $ne: candidate.content } }, { $set: { active: false } });
    await AIMemory.updateOne(
      { userId, patientId: patientId ?? null, referralId: referralId ?? null, type: candidate.type, content: candidate.content },
      { $set: { conversationId, sourceMessageId: messageId, patientId, referralId, active: true, importance: candidate.importance, source: "USER_EXPLICIT" } },
      { upsert: true }
    );
  }
  return candidates.map((candidate) => candidate.content);
}

export async function maybeSummarize(conversationId: string) {
  const conversation = await AIConversation.findById(conversationId).select("messages summary");
  if (!conversation || conversation.messages.length <= 12) return;
  const older = conversation.messages.slice(0, -10).filter((message) => message.role === "user");
  const summary = `Earlier user-provided context:\n${older.map((message) => message.content.slice(0, 240)).join("\n")}`.slice(0, 1800);
  await AIConversation.updateOne({ _id: conversationId }, { $set: { summary, summaryThrough: older.at(-1)?.createdAt } });
  await AIMemory.updateOne({ userId: conversation.userId, conversationId, type: "SUMMARY" }, { $set: { content: summary, source: "APPLICATION_VERIFIED", sourceMessageId: conversation.messages[0]._id, importance: 50, active: true } }, { upsert: true });
}