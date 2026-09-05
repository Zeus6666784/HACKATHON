import { Schema, model } from "mongoose";

const triageSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  symptoms: { type: String, required: true },
  aiPriority: String,
  confirmedPriority: String,
  suggestedCareLevel: String,
  reasoning: String,
  recommendedNextAction: String,
  caution: String,
  doctorId: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export const TriageAssessment = model("TriageAssessment", triageSchema);
