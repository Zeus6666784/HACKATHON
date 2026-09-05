import { Schema, model } from "mongoose";

const patientSchema = new Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["M", "F", "O"], required: true },
  location: { type: String, required: true },
  contact: String
}, { timestamps: true });

export const Patient = model("Patient", patientSchema);
