export type TriageResult = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  suggestedCareLevel: "PHC" | "DISTRICT" | "TERTIARY";
  relevantServices: string[];
  reasoning: string;
  recommendedNextAction: string;
  caution: string;
  source: "AI" | "FALLBACK";
};

import { SafetyValidator } from "./safety.service";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

interface AIProvider {
  assess(symptoms: string): Promise<TriageResult>;
}

class FallbackProvider implements AIProvider {
  async assess(symptoms: string): Promise<TriageResult> {
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
}

class GeminiProvider implements AIProvider {
  private genAI = new GoogleGenerativeAI(env.geminiApiKey || "");
  private model = this.genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  private systemPrompt = `
    You are a medical triage assistant for CareConnect Maharashtra.
    Your goal is to analyze symptoms and suggest the priority and care level.

    STRICT RULES:
    1. You provide DECISION SUPPORT only.
    2. NEVER diagnose a disease (e.g., do not say "Patient has Pneumonia").
    3. NEVER prescribe medication or dosage.
    4. NEVER claim a confirmed diagnosis or absolute certainty.
    5. Use "Danger Signs" to determine urgency.

    OUTPUT SCHEMA:
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "suggestedCareLevel": "PHC" | "DISTRICT" | "TERTIARY",
      "relevantServices": ["Service A", "Service B"],
      "reasoning": "Explain based on urgency and symptoms.",
      "recommendedNextAction": "Next clinical step.",
      "caution": "Mandatory safety disclaimer."
    }
  `;

  async assess(symptoms: string): Promise<TriageResult> {
    const prompt = `${this.systemPrompt}\n\nPatient Symptoms: ${symptoms}`;
    const result = await this.model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const parsed = JSON.parse(text);

    return {
      ...parsed,
      source: "AI"
    };
  }
}

const providers: Record<string, AIProvider> = {
  fallback: new FallbackProvider(),
  gemini: new GeminiProvider(),
};

export async function assessTriage(symptoms: string): Promise<TriageResult> {
  const fallbackProvider = providers["fallback"];

  try {
    // Use the live Gemini provider. If API key is missing or fails, it hits the catch block.
    const provider = providers["gemini"];
    const result = await provider.assess(symptoms);

    const validation = SafetyValidator.validate(result);
    if (validation.safe) {
      return result;
    }

    console.warn(`AI result rejected by safety validator: ${validation.error}`);
  } catch (e) {
    console.error("AI Provider Error (Falling back):", e);
  }

  return await fallbackProvider.assess(symptoms);
}
