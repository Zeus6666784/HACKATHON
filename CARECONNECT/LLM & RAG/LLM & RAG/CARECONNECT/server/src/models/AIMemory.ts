import { Schema, model } from "mongoose";

const memorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  conversationId: { type: Schema.Types.ObjectId, ref: "AIConversation", required: true },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
  referralId: { type: Schema.Types.ObjectId, ref: "Referral" },
  content: { type: String, required: true, maxlength: 1000 },
  type: { type: String, enum: ["STRUCTURED", "SUMMARY", "CONTEXT"], required: true },
  importance: { type: Number, min: 0, max: 100, default: 50 },
  sourceMessageId: { type: Schema.Types.ObjectId, required: true },
  source: { type: String, enum: ["USER_EXPLICIT", "APPLICATION_VERIFIED"], required: true },
  active: { type: Boolean, default: true, index: true },
  validUntil: Date
}, { timestamps: true });

memorySchema.index({ userId: 1, active: 1, type: 1, updatedAt: -1 });
memorySchema.index({ userId: 1, content: "text" });

export const AIMemory = model("AIMemory", memorySchema);