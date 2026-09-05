import { Schema, model } from "mongoose";

const medicationItemSchema = new Schema({
  drugName: { type: String, required: true, maxlength: 200 },
  dosage: { type: String, required: true, maxlength: 100 },
  frequency: { type: String, required: true, maxlength: 100 },
  durationDays: { type: Number, required: true, min: 1, max: 3650 },
  instructions: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ["ACTIVE", "COMPLETED", "DISCONTINUED"], default: "ACTIVE" }
});

const medicationPlanSchema = new Schema({
  referralId: { type: Schema.Types.ObjectId, ref: "Referral", required: true, index: true },
  prescribedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: { type: [medicationItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
  signedOff: { type: Boolean, default: false },
  signedOffAt: Date
}, { timestamps: true });

export const MedicationPlan = model("MedicationPlan", medicationPlanSchema);
