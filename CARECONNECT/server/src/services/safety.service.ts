import { TriageResult } from "./triage.service";
import { z } from "zod";

const TriageSchema = z.object({
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  suggestedCareLevel: z.enum(["PHC", "DISTRICT", "TERTIARY"]),
  relevantServices: z.array(z.string()),
  reasoning: z.string(),
  recommendedNextAction: z.string(),
  caution: z.string(),
  source: z.enum(["AI", "FALLBACK"]),
});

const FORBIDDEN_TERMS = [
  "diagnose", "diagnosis", "prescribe", "prescription",
  "medication", "dosage", "confirmed", "definitely",
  "treatment plan", "cure", "medicine"
];

export class SafetyValidator {
  static validate(result: any): { safe: boolean; error?: string } {
    // 1. Schema Validation
    const schemaCheck = TriageSchema.safeParse(result);
    if (!schemaCheck.success) {
      return { safe: false, error: "Invalid output schema" };
    }

    // 2. Content Safety Check
    // Scan reasoning, next action, and caution for forbidden terms
    const contentToScan = [
      result.reasoning,
      result.recommendedNextAction,
      result.caution
    ].join(" ").toLowerCase();

    for (const term of FORBIDDEN_TERMS) {
      if (contentToScan.includes(term)) {
        return { safe: false, error: `Safety violation: forbidden term '${term}' detected` };
      }
    }

    return { safe: true };
  }
}
