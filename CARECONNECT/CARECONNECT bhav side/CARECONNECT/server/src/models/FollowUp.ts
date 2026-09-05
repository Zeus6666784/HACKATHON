import { Schema, model } from "mongoose";

export const FOLLOW_UP_STATUSES = ["UPCOMING", "DUE", "COMPLETED", "MISSED", "OVERDUE"] as const;

const followUpSchema = new Schema({
  referralId: { type: Schema.Types.ObjectId, ref: "Referral", required: true, index: true },
  dueDate: { type: Date, required: true },
  purpose: { type: String, required: true, maxlength: 500 },
  requiredFacilityId: { type: Schema.Types.ObjectId, ref: "Facility" },
  status: { type: String, enum: FOLLOW_UP_STATUSES, default: "UPCOMING" },
  notes: { type: String, maxlength: 1000 },
  completedAt: Date,
  completedBy: { type: Schema.Types.ObjectId, ref: "User" },
  assignedAshaWorker: String
}, { timestamps: true });

export const FollowUp = model("FollowUp", followUpSchema);
