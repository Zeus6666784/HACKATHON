import { Router } from "express";
import { z } from "zod";
import { Patient } from "../models/Patient";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";

const router = Router();

const patientSchema = z.object({
  patientId: z.string().min(2),
  name: z.string().min(2),
  age: z.number().int().min(0).max(130),
  gender: z.enum(["M", "O", "F"]),
  location: z.string().min(2),
  coordinates: z.array(z.number()).length(2).optional(),
  contact: z.string().optional()
});

router.use(requireAuth);

router.post("/", requireRoles("HEALTH_WORKER", "DOCTOR"), async (req: AuthRequest, res, next) => {
  try {
    const data = patientSchema.parse(req.body);
    const patient = await Patient.create({
      ...data,
      facilityId: req.user?.facilityId
    });
    res.status(201).json({ success: true, data: patient });
  } catch (e) { next(e); }
});

router.get("/", requireRoles("HEALTH_WORKER", "DOCTOR"), async (req: AuthRequest, res, next) => {
  try {
    const filter = req.user?.role === "ADMIN" ? {} : { facilityId: req.user?.facilityId };
    const patients = await Patient.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: patients });
  } catch (e) { next(e); }
});

router.get("/:id", requireRoles("HEALTH_WORKER", "DOCTOR"), async (req: AuthRequest, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });

    if (req.user?.role !== "ADMIN" && String(patient.facilityId) !== String(req.user?.facilityId)) {
      return res.status(403).json({ success: false, error: "You are not authorized to view this patient" });
    }

    res.json({ success: true, data: patient });
  } catch (e) { next(e); }
});

export default router;
