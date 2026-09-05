import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "DOCTOR", "HEALTH_WORKER", "FACILITY_STAFF"],
    required: true
  },
  facilityId: { type: Schema.Types.ObjectId, ref: "Facility" },
  name: { type: String, required: true }
}, { timestamps: true });

export const User = model("User", userSchema);
