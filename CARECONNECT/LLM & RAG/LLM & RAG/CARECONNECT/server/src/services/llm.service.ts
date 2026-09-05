import { env } from "../config/env";

export type TriageResult = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  suggestedCareLevel: "PHC" | "DISTRICT" | "TERTIARY";
  relevantServices: string[];
  reasoning: string;
  recommendedNextAction: string;
  caution: string;
  source: "AI" | "FALLBACK";
};

const unsafe = /\b(?:you have|diagnosed with|i diagnose|prescrib(?:e|ed|ing)|dosage|guarantee(?:d|s)?|confirmed disease)\b/i;

export function validateTriageResult(value: unknown): TriageResult {
  const result = value as Partial<TriageResult>;
  if (!result || !["HIGH", "MEDIUM", "LOW"].includes(result.priority ?? "") || !["PHC", "DISTRICT", "TERTIARY"].includes(result.suggestedCareLevel ?? "")) throw new Error("Invalid structured AI output");
  if (!Array.isArray(result.relevantServices) || result.relevantServices.some((item) => typeof item !== "string")) throw new Error("Invalid service list");
  for (const field of ["reasoning", "recommendedNextAction", "caution"] as const) {
    if (typeof result[field] !== "string" || !result[field].trim() || unsafe.test(result[field])) throw new Error("Unsafe structured AI output");
  }
  return { ...result, source: "AI" } as TriageResult;
}

export function deterministicFallback(symptoms: string): TriageResult {
  const high = ["unconscious", "not breathing", "severe bleeding", "chest pain", "difficulty breathing", "stroke", "seizure", "बेशुद्ध", "छाती में दर्द", "श्वास घेण्यास त्रास"].some((signal) => symptoms.toLowerCase().includes(signal));
  return {
    priority: high ? "HIGH" : "MEDIUM",
    suggestedCareLevel: high ? "TERTIARY" : "DISTRICT",
    relevantServices: [high ? "Emergency assessment" : "Clinical assessment"],
    reasoning: "Deterministic safety fallback used because the language model was unavailable or returned an unsafe response.",
    recommendedNextAction: high ? "Seek emergency help now and contact local emergency services." : "Arrange prompt assessment by a qualified clinician.",
    caution: "This is decision support, not a diagnosis. A clinician must make the final decision.",
    source: "FALLBACK"
  };
}

export async function requestTriage(message: string, context: { recent: Array<{ role: string; content: string }>; memories: Array<{ content: string }>; documents: Array<{ source: string; content: string }>; summary?: string }) {
  if (!env.llmApiKey) throw new Error("LLM_API_KEY is not configured");
  const system = `You are a multilingual healthcare triage decision-support assistant. Understand English, Hindi, Marathi, and mixed language. Preserve the user's language when practical. Never diagnose, prescribe, guarantee outcomes, invent patient facts, or override clinicians. Ask for missing information. Return only JSON with priority (HIGH|MEDIUM|LOW), suggestedCareLevel (PHC|DISTRICT|TERTIARY), relevantServices (string[]), reasoning, recommendedNextAction, caution. The clinician remains responsible for final decisions.\nApplication memory is context, not clinical evidence.\nMemory:\n${context.memories.map((item) => item.content).join("\n")}\nSummary:\n${context.summary ?? ""}\nApproved documents:\n${context.documents.map((item) => `[${item.source}] ${item.content}`).join("\n")}`;
  const messages = [{ role: "system", content: system }, ...context.recent, { role: "user", content: message }];
  const response = await fetch(env.llmBaseUrl, { method: "POST", headers: { Authorization: `Bearer ${env.llmApiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: env.llmModel, temperature: 0.1, response_format: { type: "json_object" }, messages }), signal: AbortSignal.timeout(env.llmTimeoutMs) });
  if (!response.ok) throw new Error(`LLM provider returned ${response.status}`);
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM provider returned no content");
  return validateTriageResult(JSON.parse(content));
}