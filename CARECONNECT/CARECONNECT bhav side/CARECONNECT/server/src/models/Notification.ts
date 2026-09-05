import { Schema, model } from "mongoose";

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: ["URGENT", "INFO", "SUCCESS", "WARNING"], required: true },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true, maxlength: 1000 },
  referralId: { type: Schema.Types.ObjectId, ref: "Referral" },
  read: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
export const Notification = model("Notification", notificationSchema);
