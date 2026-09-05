import { z } from "zod";
import { SERVICES } from "./constants";

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(64),
  password: z.string().min(8).max(128),
});

export const patientSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  age: z.coerce.number().int().min(0).max(120),
  sex: z.enum(["female", "male", "other"]),
  phone: z.string().trim().max(15).optional().or(z.literal("")),
  village: z.string().trim().min(2).max(80),
  taluka: z.string().trim().min(2).max(80),
  district: z.string().trim().min(2).max(80).default("Palghar"),
  caregiverName: z.string().trim().max(80).optional().or(z.literal("")),
  latitude: z.coerce.number().min(15).max(25).optional(),
  longitude: z.coerce.number().min(70).max(80).optional(),
});

export const triageSchema = z.object({
  patientId: z.string().min(1),
  chiefComplaint: z.string().trim().min(3).max(400),
  requiredService: z.enum(SERVICES),
  dangerSigns: z.array(z.string()).default([]),
  vitals: z
    .object({
      temperatureC: z.coerce.number().min(30).max(45).optional(),
      pulse: z.coerce.number().int().min(20).max(220).optional(),
      respiratoryRate: z.coerce.number().int().min(5).max(80).optional(),
      systolicBp: z.coerce.number().int().min(50).max(260).optional(),
      spo2: z.coerce.number().int().min(50).max(100).optional(),
      pregnant: z.boolean().optional(),
      age: z.coerce.number().int().min(0).max(120).optional(),
    })
    .optional(),
});

export const referSchema = z.object({
  referralId: z.string().min(1),
  toFacilityId: z.string().min(1),
  fromFacilityId: z.string().optional(),
});

export const advanceSchema = z.object({
  referralId: z.string().min(1),
  note: z.string().trim().max(800).optional().or(z.literal("")),
  appointmentAt: z.string().optional(),
});
