import { Schema, model } from "mongoose";

const medicationReminderSchema = new Schema({
  planId: { type: Schema.Types.ObjectId, ref: "MedicationPlan", required: true, index: true },
  referralId: { type: Schema.Types.ObjectId, ref: "Referral", required: true, index: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ["SCHEDULED", "TAKEN", "SKIPPED", "SNOOZED"], default: "SCHEDULED" },
  reason: { type: String, maxlength: 500 },
  snoozedUntil: Date,
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export const MedicationReminder = model("MedicationReminder", medicationReminderSchema);
