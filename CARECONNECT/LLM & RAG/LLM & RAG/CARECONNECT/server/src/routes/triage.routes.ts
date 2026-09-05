import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";
import { assessTriage } from "../services/triage.service";
import { TriageAssessment } from "../models/TriageAssessment";

const router = Router();
router.use(requireAuth, requireRoles("HEALTH_WORKER", "DOCTOR"));

router.post("/assess", async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      patientId: z.string().min(1),
      symptoms: z.string().min(3).max(5000)
    }).parse(req.body);

    const result = await assessTriage(data.symptoms);
    const saved = await TriageAssessment.create({
      patientId: data.patientId,
      symptoms: data.symptoms,
      aiPriority: result.priority,
      suggestedCareLevel: result.suggestedCareLevel,
      reasoning: result.reasoning,
      recommendedNextAction: result.recommendedNextAction,
      caution: result.caution,
      doctorId: req.user?.id
    });

    res.json({ success: true, data: { ...result, assessmentId: saved.id } });
  } catch (e) { next(e); }
});

export default router;
