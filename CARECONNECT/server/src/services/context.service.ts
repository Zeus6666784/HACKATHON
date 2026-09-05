import { Patient } from "../models/Patient";
import { ragService } from "./rag.service";
import mongoose from "mongoose";

export interface AIContext {
  ragContext: string;
  patientData: any;
  clinicalNotes: string[];
}

export async function buildAIContext(patientId: string): Promise<AIContext> {
  try {
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      throw new Error("Invalid patient ID format");
    }

    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error("Patient not found");

    // Retrieve relevant clinical guidelines based on patient's known conditions
    // In a real system, we'd extract keywords from patient's history
    const ragQuery = patient.location || "clinical triage guidelines";
    const ragContext = await ragService.retrieveRAG(ragQuery);

    return {
      ragContext: ragContext || "No specific clinical guidelines retrieved.",
      patientData: patient,
      clinicalNotes: [] // Could be expanded to include past referrals
    };
  } catch (e) {
    console.error("Context build error:", e);
    return {
      ragContext: "Error retrieving context.",
      patientData: {},
      clinicalNotes: []
    };
  }
}
