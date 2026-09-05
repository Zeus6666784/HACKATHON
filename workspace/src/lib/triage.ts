import type { CareLevel, Priority } from "./constants";

export const DANGER_SIGNS = [
  { id: "unconscious", label: { en: "Unconscious / not waking", hi: "बेहोश / नहीं जाग रहे", mr: "बेशुद्ध / जागे होत नाही" } },
  { id: "convulsion", label: { en: "Convulsions", hi: "दौरे", mr: "आक्षेप" } },
  { id: "severeBleed", label: { en: "Heavy bleeding", hi: "तेज रक्तस्राव", mr: "जास्त रक्तस्राव" } },
  { id: "breathing", label: { en: "Difficulty breathing", hi: "सांस लेने में तकलीफ", mr: "श्वास घेण्यास त्रास" } },
  { id: "chestPain", label: { en: "Severe chest pain", hi: "तेज सीने का दर्द", mr: "तीव्र छाती दुखणे" } },
  { id: "pregnancyBleed", label: { en: "Bleeding in pregnancy", hi: "गर्भावस्था में रक्तस्राव", mr: "गर्भावस्थेत रक्तस्राव" } },
  { id: "labour", label: { en: "Labour / delivery concern", hi: "प्रसव संबंधी चिंता", mr: "प्रसूती संबंधित चिंता" } },
  { id: "highFever", label: { en: "High fever with lethargy", hi: "तेज बुखार और सुस्ती", mr: "तीव्र ताप व सुस्ती" } },
  { id: "dehydration", label: { en: "Unable to drink / sunken eyes", hi: "पानी नहीं पी पा रहे", mr: "पाणी पिऊ शकत नाही" } },
  { id: "injury", label: { en: "Major injury / fracture", hi: "गंभीर चोट", mr: "मोठी दुखापत" } },
] as const;

export type Vitals = {
  temperatureC?: number;
  pulse?: number;
  respiratoryRate?: number;
  systolicBp?: number;
  spo2?: number;
  pregnant?: boolean;
  age?: number;
};

export type TriageInput = {
  chiefComplaint: string;
  dangerSigns: string[];
  requiredService: string;
  vitals?: Vitals;
};

export type TriageResult = {
  priority: Priority;
  recommendedLevel: CareLevel;
  rationale: string;
  source: "rules" | "rules+model";
  disclaimer: string;
};

const DISCLAIMER =
  "Priority level only. This is not a diagnosis, disease name, or treatment plan. A clinician must assess the patient.";

function clampLevel(level: CareLevel, min: CareLevel): CareLevel {
  const order: CareLevel[] = ["SC", "PHC", "RH", "SDH", "DH"];
  return order.indexOf(level) < order.indexOf(min) ? min : level;
}

export function ruleTriage(input: TriageInput): TriageResult {
  const signs = new Set(input.dangerSigns);
  const v = input.vitals ?? {};
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

export async function runTriage(input: TriageInput): Promise<TriageResult> {
  const base = ruleTriage(input);
  const key = process.env.USER_LLM_API_KEY;
  const url = process.env.USER_LLM_BASE_URL;
  const model = process.env.USER_LLM_MODEL;
  if (!key || !url || !model) return base;

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are a rural referral triage assistant for Maharashtra public facilities. Return JSON only: {priority: EMERGENCY|URGENT|ROUTINE, recommendedLevel: SC|PHC|RH|SDH|DH, rationale: string}. NEVER name a disease, NEVER give a diagnosis, NEVER suggest medicines. Priority and care-level only.",
          },
          {
            role: "user",
            content: JSON.stringify({
              complaint: input.chiefComplaint,
              dangerSigns: input.dangerSigns,
              requiredService: input.requiredService,
              vitals: input.vitals,
              rulePriority: base.priority,
            }),
          },
        ],
      }),
    });
    if (!res.ok) return base;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content ?? "";
    const jsonText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonText) as {
      priority?: Priority;
      recommendedLevel?: CareLevel;
      rationale?: string;
    };
    const priority = ["EMERGENCY", "URGENT", "ROUTINE"].includes(parsed.priority ?? "")
      ? (parsed.priority as Priority)
      : base.priority;
    const recommendedLevel = ["SC", "PHC", "RH", "SDH", "DH"].includes(parsed.recommendedLevel ?? "")
      ? (parsed.recommendedLevel as CareLevel)
      : base.recommendedLevel;
    return {
      priority,
      recommendedLevel,
      rationale: `${parsed.rationale ?? base.rationale} ${DISCLAIMER}`,
      source: "rules+model",
      disclaimer: DISCLAIMER,
    };
  } catch {
    return base;
  }
}
