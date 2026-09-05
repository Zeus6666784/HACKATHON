import { Schema, model } from "mongoose";

export const REFERRAL_STATES = [
  "CREATED", "TRIAGED", "FACILITY_SELECTED", "REFERRAL_SENT",
  "REFERRAL_ACCEPTED", "REFERRAL_REJECTED", "PATIENT_ARRIVED",
  "CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING", "DIAGNOSTIC_COMPLETED",
  "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED", "OVERDUE",
  "LOST_TO_FOLLOWUP", "CANCELLED", "CLOSED"
] as const;

const referralSchema = new Schema({
  referralId: { type: String, required: true, unique: true },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  fromFacilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
  toFacilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
  status: { type: String, enum: REFERRAL_STATES, default: "CREATED" },
  priority: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], required: true },
  careLevel: { type: String, enum: ["PHC", "DISTRICT", "TERTIARY"], required: true }
}, { timestamps: true });

export const Referral = model("Referral", referralSchema);
