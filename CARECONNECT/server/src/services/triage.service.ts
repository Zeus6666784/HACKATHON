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
import Groq from "groq-sdk";
import { env } from "../config/env";
import { buildAIContext } from "./context.service";

interface AIProvider {
  assess(symptoms: string, context: any): Promise<TriageResult>;
}

class FallbackProvider implements AIProvider {
  async assess(symptoms: string, _context: any): Promise<TriageResult> {
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
    2. NEVER diagnose a disease.
    3. NEVER prescribe medication or dosage.
    4. NEVER claim a confirmed diagnosis.
    5. Use "Danger Signs" and provided context to determine urgency.

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

  async assess(symptoms: string, context: any): Promise<TriageResult> {
    const prompt = `${this.systemPrompt}\n\nApproved Guidelines:\n${context.ragContext}\n\nPatient Data: ${JSON.stringify(context.patientData)}\n\nSymptoms: ${symptoms}`;
    const result = await this.model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text);
    return { ...parsed, source: "AI" };
  }
}

class GroqProvider implements AIProvider {
  private groq = new Groq({ apiKey: env.groqApiKey || "" });

  private systemPrompt = `
    You are a medical triage assistant for CareConnect Maharashtra.
    Your goal is to analyze symptoms and suggest the priority and care level.

    STRICT RULES:
    1. You provide DECISION SUPPORT only.
    2. NEVER diagnose a disease.
    3. NEVER prescribe medication or dosage.
    4. NEVER claim a confirmed diagnosis.
    5. Use "Danger Signs" and provided context to determine urgency.

    OUTPUT SCHEMA (Return ONLY JSON):
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "suggestedCareLevel": "PHC" | "DISTRICT" | "TERTIARY",
      "relevantServices": ["Service A", "Service B"],
      "reasoning": "Explain based on urgency and symptoms.",
      "recommendedNextAction": "Next clinical step.",
      "caution": "Mandatory safety disclaimer."
    }
  `;

  async assess(symptoms: string, context: any): Promise<TriageResult> {
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: `Context:\n${context.ragContext}\n\nPatient: ${JSON.stringify(context.patientData)}\n\nSymptoms: ${symptoms}` },
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
    });

    const text = chatCompletion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text);
    return { ...parsed, source: "AI" };
  }
}

const providers: Record<string, AIProvider> = {
  fallback: new FallbackProvider(),
  gemini: new GeminiProvider(),
  groq: new GroqProvider(),
};

export async function assessTriage(symptoms: string, patientId: string): Promise<TriageResult> {
  const fallbackProvider = providers["fallback"];

  try {
    const context = await buildAIContext(patientId);
    const provider = providers["groq"];
    const result = await provider.assess(symptoms, context);

    const validation = SafetyValidator.validate(result);
    if (validation.safe) {
      return result;
    }

    console.warn(`AI result rejected by safety validator: ${validation.error}`);
  } catch (e) {
    console.error("AI Provider Error (Falling back):", e);
  }

  return await fallbackProvider.assess(symptoms, {});
}
