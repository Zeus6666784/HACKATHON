import { Schema, model } from "mongoose";

const triageSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  vitals: {
    heartRate: Number,
    systolicBP: Number,
    diastolicBP: Number,
    spo2: Number,
    temperature: Number,
    respiratoryRate: Number,
    consciousness: { type: String, enum: ["alert", "verbal", "pain", "unresponsive"] }
  },
  symptoms: { type: [String], required: true },
  riskFactors: { type: [String], default: [] },
  urgency: { type: String, enum: ["EMERGENCY", "URGENT", "ROUTINE"], required: true },
  recommendedReferral: String,
  timestamp: { type: Date, default: Date.now },
  clinicalNotes: String,
  doctorId: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export const TriageAssessment = model("TriageAssessment", triageSchema);
