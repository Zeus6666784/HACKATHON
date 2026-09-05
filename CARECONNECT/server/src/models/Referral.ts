import { Schema, model } from "mongoose";

export const REFERRAL_STATES = [
  "SUBMITTED", "ACCEPTED", "BED RESERVED", "IN TRANSIT", "ARRIVED", "COMPLETED"
] as const;

const referralSchema = new Schema({
  referralId: { type: String, required: true, unique: true },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  fromFacilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
  toFacilityId: { type: Schema.Types.ObjectId, ref: "Facility", required: true },
  status: { type: String, enum: REFERRAL_STATES, default: "SUBMITTED" },
  urgency: { type: String, enum: ["EMERGENCY", "URGENT", "ROUTINE"], required: true },
  requiredSpecialty: { type: String, required: true },
  reservedBedId: { type: String },
  ambulanceId: { type: String },
  ambulanceDriver: { type: String },
}, { timestamps: true });

export const Referral = model("Referral", referralSchema);
