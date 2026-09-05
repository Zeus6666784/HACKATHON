import { Router } from "express";
import { z } from "zod";
import { Patient } from "../models/Patient";
import { requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

const patientSchema = z.object({
  patientId: z.string().min(2),
  name: z.string().min(2),
  age: z.number().int().min(0).max(130),
  gender: z.enum(["M", "F", "O"]),
  location: z.string().min(2),
  contact: z.string().optional()
});

router.use(requireAuth);

router.post("/", requireRoles("HEALTH_WORKER", "DOCTOR"), async (req, res, next) => {
  try {
    const data = patientSchema.parse(req.body);
    const patient = await Patient.create(data);
    res.status(201).json({ success: true, data: patient });
  } catch (e) { next(e); }
});

router.get("/", requireRoles("HEALTH_WORKER", "DOCTOR"), async (_req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: patients });
  } catch (e) { next(e); }
});

router.get("/:id", requireRoles("HEALTH_WORKER", "DOCTOR"), async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });
    res.json({ success: true, data: patient });
  } catch (e) { next(e); }
});

export default router;
