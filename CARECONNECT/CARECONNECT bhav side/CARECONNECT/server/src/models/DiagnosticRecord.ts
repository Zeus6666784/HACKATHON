import { Schema, model } from "mongoose";

const diagnosticRecordSchema = new Schema({
  referralId: { type: Schema.Types.ObjectId, ref: "Referral", required: true, index: true },
  orderedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tests: [{ name: { type: String, required: true }, result: String, status: { type: String, enum: ["PENDING", "COMPLETED"], required: true } }],
  completedAt: Date
}, { timestamps: true });

export const DiagnosticRecord = model("DiagnosticRecord", diagnosticRecordSchema);
