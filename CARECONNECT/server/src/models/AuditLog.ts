import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  detail: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // e.g., "LOGIN", "CREATE_PATIENT"
  entity: { type: String, required: true }, // e.g., "User", "Patient", "Referral"
  entityId: { type: String },
  detail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
