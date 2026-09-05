import { SafetyValidator } from "./safety.service";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { env } from "../config/env";
import { buildAIContext } from "./context.service";

export type Priority = "EMERGENCY" | "URGENT" | "ROUTINE";
export type CareLevel = "SC" | "PHC" | "RH" | "SDH" | "DH";

export type TriageResult = {
  priority: Priority;
  recommendedLevel: CareLevel;
  rationale: string;
  source: "rules" | "rules+model";
  disclaimer: string;
};

const DISCLAIMER = "Priority level only. This is not a diagnosis, disease name, or treatment plan. A clinician must assess the patient.";

function clampLevel(level: CareLevel, min: CareLevel): CareLevel {
  const order: CareLevel[] = ["SC", "PHC", "RH", "SDH", "DH"];
  return order.indexOf(level) < order.indexOf(min) ? min : level;
}

export function ruleTriage(input: any): TriageResult {
  const signs = new Set(input.dangerSigns || []);
  const v = input.vitals || {};
  let score = 0;
  const reasons: string[] = [];

  const emergencySigns = ["unconscious", "convulsion", "severeBleed", "breathing", "chestPain", "pregnancyBleed"];
  for (const s of emergencySigns) {
    if (signs.has(s)) {
      score += 40;
      reasons.push(`danger-sign:${s}`);
    }
  }
  if (signs.has("labour") || signs.has("injury") || signs.has("highFever") || signs.has("dehydration")) {
    score += 18;
    reasons.push("urgent-danger-sign");
  }

  if (v.spo2 !== undefined && v.spo2 < 90) {
    score += 40;
    reasons.push("spo2<90");
  } else if (v.spo2 !== undefined && v.spo2 < 94) {
    score += 18;
    reasons.push("spo2<94");
  }
  if (v.systolicBp !== undefined && (v.systolicBp < 90 || v.systolicBp > 180)) {
    score += 28;
    reasons.push("abnormal-bp");
  }
  if (v.pulse !== undefined && (v.pulse > 130 || v.pulse < 45)) {
    score += 22;
    reasons.push("abnormal-pulse");
  }
  if (v.respiratoryRate !== undefined && (v.respiratoryRate > 30 || v.respiratoryRate < 8)) {
    score += 22;
    reasons.push("abnormal-rr");
  }
  if (v.temperatureC !== undefined && v.temperatureC >= 39.5) {
    score += 12;
    reasons.push("high-temp");
  }
  if (v.pregnant && (signs.has("labour") || signs.has("pregnancyBleed") || input.requiredService === "maternal")) {
    score += 10;
    reasons.push("pregnancy-pathway");
  }
  if (v.age !== undefined && v.age < 5 && score > 0) {
    score += 8;
    reasons.push("under-5");
  }

  let priority: Priority = "ROUTINE";
  let recommendedLevel: CareLevel = "PHC";

  if (score >= 40 || input.requiredService === "emergency") {
    priority = "EMERGENCY";
    recommendedLevel = input.requiredService === "surgery" ? "DH" : "RH";
  } else if (score >= 18 || ["imaging", "surgery", "mental"].includes(input.requiredService)) {
    priority = "URGENT";
    recommendedLevel = input.requiredService === "surgery" ? "SDH" : "RH";
  } else if (["lab", "ncd", "tb", "maternal", "pediatric"].includes(input.requiredService)) {
    recommendedLevel = "PHC";
  } else {
    recommendedLevel = "SC";
  }

  if (priority === "EMERGENCY") recommendedLevel = clampLevel(recommendedLevel, "RH");
  if (input.requiredService === "imaging") recommendedLevel = clampLevel(recommendedLevel, "SDH");
  if (input.requiredService === "surgery") recommendedLevel = clampLevel(recommendedLevel, "SDH");

  const rationale = `Rule-based priority only (${score} risk points). Signals: ${
    reasons.length ? reasons.join(", ") : "no danger flags"
  }. Recommended public care level: ${recommendedLevel}. ${DISCLAIMER}`;

  return { priority, recommendedLevel, rationale, source: "rules", disclaimer: DISCLAIMER };
}

interface AIProvider {
  assess(input: any, context: any): Promise<Partial<TriageResult>>;
}

class GeminiProvider implements AIProvider {
  private genAI = new GoogleGenerativeAI(env.geminiApiKey || "");
  private model = this.genAI.getGenerativeModel({
    model: "gemini-pro",
    generationConfig: { responseMimeType: "application/json" },
  });

  async assess(input: any, context: any): Promise<Partial<TriageResult>> {
    const prompt = `
      You are a rural referral triage assistant for Maharashtra public facilities.
      Return JSON only: {priority: EMERGENCY|URGENT|ROUTINE, recommendedLevel: SC|PHC|RH|SDH|DH, rationale: string}.
      NEVER name a disease, NEVER give a diagnosis, NEVER suggest medicines. Priority and care-level only.

      Approved Guidelines: ${context.ragContext}
      Patient Data: ${JSON.stringify(context.patientData)}
      Triage Input: ${JSON.stringify(input)}
    `;
    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }
}

class GroqProvider implements AIProvider {
  private groq = new Groq({ apiKey: env.groqApiKey || "" });

  async assess(input: any, context: any): Promise<Partial<TriageResult>> {
    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a rural referral triage assistant for Maharashtra public facilities. Return JSON only: {priority: EMERGENCY|URGENT|ROUTINE, recommendedLevel: SC|PHC|RH|SDH|DH, rationale: string}. NEVER name a disease, NEVER give a diagnosis, NEVER suggest medicines. Priority and care-level only." },
        { role: "user", content: `Guidelines: ${context.ragContext}\nPatient: ${JSON.stringify(context.patientData)}\nInput: ${JSON.stringify(input)}` },
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
    });
    return JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  }
}

const providers: Record<string, AIProvider> = {
  gemini: new GeminiProvider(),
  groq: new GroqProvider(),
};

export async function assessTriage(input: any, patientId: string): Promise<TriageResult> {
  const base = ruleTriage(input);

  try {
    const context = await buildAIContext(patientId);
    const provider = providers["groq"]; // Default to Groq for speed
    const aiResult = await provider.assess(input, context);

    const priority = ["EMERGENCY", "URGENT", "ROUTINE"].includes(aiResult.priority ?? "")
      ? (aiResult.priority as Priority)
      : base.priority;
    const recommendedLevel = ["SC", "PHC", "RH", "SDH", "DH"].includes(aiResult.recommendedLevel ?? "")
      ? (aiResult.recommendedLevel as CareLevel)
      : base.recommendedLevel;

    const result: TriageResult = {
      priority,
      recommendedLevel,
      rationale: `${aiResult.rationale ?? base.rationale} ${DISCLAIMER}`,
      source: "rules+model",
      disclaimer: DISCLAIMER,
    };

    const validation = SafetyValidator.validate(result);
    if (validation.safe) return result;

    console.warn(`AI result rejected by safety validator: ${validation.error}`);
  } catch (e) {
    console.error("AI Triage Error (Falling back to rules):", e);
  }

  return base;
}
