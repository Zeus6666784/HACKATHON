import { Schema, model } from "mongoose";

const facilitySchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["PHC", "DISTRICT", "TERTIARY"], required: true },
  coordinates: { type: [Number], required: true },
  services: { type: [String], default: [] },
  specialists: { type: [String], default: [] },
  emergencyCapability: { type: Boolean, default: false },
  verificationState: {
    type: String,
    enum: ["VERIFIED", "UNVERIFIED", "UNKNOWN", "SYNTHETIC"],
    default: "UNKNOWN"
  },
  source: String
}, { timestamps: true });

facilitySchema.index({ coordinates: "2dsphere" });
export const Facility = model("Facility", facilitySchema);
