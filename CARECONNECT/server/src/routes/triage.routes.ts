import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";
import { assessTriage } from "../services/triage.service";
import { TriageAssessment } from "../models/TriageAssessment";
import { Patient } from "../models/Patient";

const router = Router();
router.use(requireAuth, requireRoles("HEALTH_WORKER", "DOCTOR"));

router.post("/assess", async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      patientId: z.string().min(1),
      triageInput: z.object({
        chiefComplaint: z.string().min(1),
        dangerSigns: z.array(z.string()),
        requiredService: z.string(),
        vitals: z.any().optional()
      })
    }).parse(req.body);

    const patient = await Patient.findOne({ patientId: data.patientId });
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });

    if (req.user?.role !== "ADMIN" && String(patient.facilityId) !== String(req.user?.facilityId)) {
      return res.status(403).json({ success: false, error: "You are not authorized to assess this patient" });
    }

    const result = await assessTriage(data.triageInput, data.patientId);
    const saved = await TriageAssessment.create({
      patientId: data.patientId,
      symptoms: JSON.stringify(data.triageInput),
      aiPriority: result.priority,
      suggestedCareLevel: result.recommendedLevel,
      reasoning: result.rationale,
      caution: result.disclaimer,
      doctorId: req.user?.id
    });

    res.json({ success: true, data: { ...result, assessmentId: saved.id } });
  } catch (e) { next(e); }
});

export default router;
