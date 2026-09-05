import axios from "axios";
import { env } from "../config/env";

export interface AiResponse {
  priority: "HIGH" | "MEDIUM" | "LOW";
  suggestedCareLevel: "PHC" | "DISTRICT" | "TERTIARY";
  relevantServices: string[];
  reasoning: string;
  recommendedNextAction: string;
  caution: string;
}

export class AiProvider {
  private static API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

  public static async getTriageAssessment(symptoms: string): Promise<AiResponse> {
    if (!env.nvidiaApiKey) {
      throw new Error("NVIDIA API key not configured");
    }

    const systemPrompt = `
      You are a Clinical Decision Support AI for healthcare workers in rural Maharashtra.
      You support inputs in English, Hindi, and Marathi.
      Your goal is to determine the urgency and required level of care based on reported symptoms.

      CRITICAL SAFETY RULES:
      1. NO DIAGNOSIS: Do not name a disease. Do not say "Patient has X". Instead, say "Symptoms are consistent with high urgency".
      2. NO PRESCRIPTION: Do not suggest medication, dosages, or treatments.
      3. DECISION SUPPORT ONLY: State clearly that clinical verification is required.
      4. DANGER SIGNS: Prioritize neurological, cardiovascular, and respiratory danger signs.

      OUTPUT FORMAT:
      You MUST respond in strict JSON format (in English):
      {
        "priority": "HIGH" | "MEDIUM" | "LOW",
        "suggestedCareLevel": "PHC" | "DISTRICT" | "TERTIARY",
        "relevantServices": ["Service A", "Service B"],
        "reasoning": "Detailed explanation based on danger signs",
        "recommendedNextAction": "Actionable next step",
        "caution": "Medical disclaimer"
      }
    `;

    const response = await axios.post(
      this.API_URL,
      {
        model: env.nvidiaModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Patient symptoms: ${symptoms}` }
        ],
        temperature: 0,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Authorization": `Bearer ${env.nvidiaApiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Safety validation
    const rawText = content.toLowerCase();
    if (rawText.includes("diagnose") || rawText.includes("prescribe") || rawText.includes("medicine")) {
      throw new Error("AI output violated safety constraints (diagnosis/prescription detected)");
    }

    return parsed;
  }
}
