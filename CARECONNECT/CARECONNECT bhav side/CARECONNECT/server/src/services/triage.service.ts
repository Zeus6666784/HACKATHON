export type TriageResult = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  suggestedCareLevel: "PHC" | "DISTRICT" | "TERTIARY";
  relevantServices: string[];
  reasoning: string;
  recommendedNextAction: string;
  caution: string;
  source: "AI" | "FALLBACK";
};

import { AiProvider } from "./aiProvider.service";

function fallback(symptoms: string): TriageResult {
  const text = symptoms.toLowerCase();
  const highSignals = ["unconscious", "severe bleeding", "chest pain", "difficulty breathing", "stroke", "seizure"];
  const high = highSignals.some((x) => text.includes(x));

  if (high) {
    return {
      priority: "HIGH",
      suggestedCareLevel: "TERTIARY",
      relevantServices: ["Emergency", "Critical care"],
      reasoning: "Symptoms contain a high-risk signal requiring urgent clinical assessment.",
      recommendedNextAction: "Arrange urgent clinical evaluation.",
      caution: "This is decision support, not a diagnosis.",
      source: "FALLBACK"
    };
  }

  return {
    priority: text.length > 80 ? "MEDIUM" : "LOW",
    suggestedCareLevel: text.length > 80 ? "DISTRICT" : "PHC",
    relevantServices: ["General medicine"],
    reasoning: "Deterministic fallback used because no validated AI result is available.",
    recommendedNextAction: "Arrange appropriate clinical assessment.",
    caution: "This is decision support, not a diagnosis.",
    source: "FALLBACK"
  };
}

export async function assessTriage(symptoms: string): Promise<TriageResult> {
  try {
    const aiResult = await AiProvider.getTriageAssessment(symptoms);
    return {
      ...aiResult,
      source: "AI"
    };
  } catch (e) {
    console.error("AI Triage failed, using fallback:", e);
    return fallback(symptoms);
  }
}
