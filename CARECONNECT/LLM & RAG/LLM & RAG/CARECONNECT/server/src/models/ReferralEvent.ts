import { Schema, model } from "mongoose";

const referralEventSchema = new Schema({
  event_id: { type: String, required: true, unique: true },
  referral_id: { type: Schema.Types.ObjectId, ref: "Referral", required: true },
  event_type: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  performed_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
  facility_id: { type: Schema.Types.ObjectId, ref: "Facility" },
  previous_status: String,
  new_status: String,
  notes: String
});

referralEventSchema.index({ referral_id: 1 });
export const ReferralEvent = model("ReferralEvent", referralEventSchema);
