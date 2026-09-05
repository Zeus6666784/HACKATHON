import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true, maxlength: 10000 },
  language: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const conversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
  referralId: { type: Schema.Types.ObjectId, ref: "Referral" },
  title: { type: String, default: "Clinical conversation" },
  messages: { type: [messageSchema], default: [] },
  summary: { type: String, default: "" },
  summaryThrough: { type: Date }
}, { timestamps: true });

conversationSchema.index({ userId: 1, updatedAt: -1 });

export const AIConversation = model("AIConversation", conversationSchema);