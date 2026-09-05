import { retrieveRAG } from "./rag.service";
import { Patient } from "../models/Patient";
import { Referral } from "../models/Referral";

export interface AIContext {
  ragContext: string;
  patientData: any;
  referralData: any;
  history: string;
}

export async function buildAIContext(patientId: string, referralId?: string, history: string[] = []) {
  const patient = await Patient.findById(patientId).lean();
  if (!patient) throw new Error("Patient not found");

  let referral = null;
  if (referralId) {
    referral = await Referral.findById(referralId).lean();
  }

  // Use symptoms from triage or a default query for RAG
  const query = patient.name; // Simple fallback query
  const ragDocs = await retrieveRAG(query);
  const ragContext = ragDocs
    .map((doc: any) => `[${doc.source}]: ${doc.chunks?.[0]?.content}`)
    .join("\n\n");

  return {
    ragContext: ragContext || "No approved guidelines found for this query.",
    patientData: patient,
    referralData: referral,
    history: history.join("\n"),
  };
}
