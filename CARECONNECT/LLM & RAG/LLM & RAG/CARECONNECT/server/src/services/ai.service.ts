import { appendMessage, createConversation, extractExplicitMemories, maybeSummarize } from "./memory.service";
import { buildAIContext } from "./context.service";
import { deterministicFallback, requestTriage, TriageResult } from "./llm.service";
import { AIConversation } from "../models/AIConversation";

export async function runAssistant(input: { userId: string; message: string; conversationId?: string; patientId?: string; referralId?: string }) {
  const conversation = input.conversationId
    ? await AIConversation.findOne({ _id: input.conversationId, userId: input.userId }).select("_id")
    : await createConversation(input.userId, input.patientId, input.referralId);
  if (!conversation) throw new Error("Conversation not found");
  const conversationId = conversation._id.toString();
  const userMessageId = await appendMessage(conversationId, "user", input.message);
  const memoriesSaved = await extractExplicitMemories(input.userId, conversationId, userMessageId, input.message, input.patientId, input.referralId);
  const context = await buildAIContext(input.userId, conversationId, input.message, input.patientId, input.referralId);
  let result: TriageResult;
  try {
    result = await requestTriage(input.message, context);
  } catch {
    result = deterministicFallback(input.message);
  }
  await appendMessage(conversationId, "assistant", JSON.stringify(result), { source: result.source });
  await maybeSummarize(conversationId);
  return { conversationId, result, memoriesSaved, retrievedContext: context.documents, structuredContext: context.structured };
}

export async function runTriage(input: { userId: string; message: string; patientId: string; conversationId?: string }): Promise<TriageResult & { conversationId: string; memoriesSaved: string[]; retrievedContext: unknown[] }> {
  const result = await runAssistant(input);
  return { ...result.result, conversationId: result.conversationId, memoriesSaved: result.memoriesSaved, retrievedContext: result.retrievedContext };
}