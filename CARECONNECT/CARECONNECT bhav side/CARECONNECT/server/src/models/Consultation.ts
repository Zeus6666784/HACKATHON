import { Schema, model } from "mongoose";

const consultationSchema = new Schema({
  referralId: { type: Schema.Types.ObjectId, ref: "Referral", required: true, unique: true },
  clinicianId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  notes: { type: String, required: true, maxlength: 5000 },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Consultation = model("Consultation", consultationSchema);
