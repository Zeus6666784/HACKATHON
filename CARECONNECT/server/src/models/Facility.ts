import { Schema, model } from "mongoose";

const facilitySchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["PHC", "DISTRICT", "TERTIARY"], required: true },
  coordinates: { type: [Number], required: true },
  services: { type: [String], default: [] },
  specialists: { type: [String], default: [] },
  emergencyCapability: { type: Boolean, default: false },
  icuBeds: { type: Number, default: 0 },
  icuAvailable: { type: Number, default: 0 },
  oxygenBeds: { type: Number, default: 0 },
  oxygenAvailable: { type: Number, default: 0 },
  ventilators: { type: Number, default: 0 },
  ventilatorsAvailable: { type: Number, default: 0 },
  verificationState: {
    type: String,
    enum: ["VERIFIED", "UNVERIFIED", "UNKNOWN", "SYNTHETIC"],
    default: "UNKNOWN"
  },
  source: String
}, { timestamps: true });

facilitySchema.index({ coordinates: "2dsphere" });
export const Facility = model("Facility", facilitySchema);
