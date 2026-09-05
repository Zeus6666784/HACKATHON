import { Router } from "express";
import { Facility } from "../models/Facility";
import { requireAuth, requireRoles } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res, next) => {
  try {
    const facilities = await Facility.find().limit(200);
    res.json({ success: true, data: facilities });
  } catch (e) { next(e); }
});

router.get("/rank", requireRoles("DOCTOR", "HEALTH_WORKER"), async (req, res, next) => {
  try {
    const symptoms = String(req.query.symptoms ?? "").toLowerCase();
    const isEmergency = String(req.query.isEmergency ?? "false") === "true";
    const facilities = await Facility.find();

    const ranked = facilities.map((f) => {
      const capabilityMatch = f.services.some((s: string) => symptoms.includes(s.toLowerCase())) ? 40 : 10;
      const emergencyMatch = isEmergency && f.emergencyCapability ? 30 : 0;
      const verification = f.verificationState === "VERIFIED" ? 20 : f.verificationState === "UNKNOWN" ? 0 : 5;
      const care = f.type === "PHC" ? 10 : f.type === "DISTRICT" ? 15 : 20;
      return { facility: f, score: capabilityMatch + emergencyMatch + verification + care };
    }).sort((a, b) => b.score - a.score);

    res.json({ success: true, data: ranked });
  } catch (e) { next(e); }
});

router.post("/", requireRoles("ADMIN"), async (req, res, next) => {
  try {
    const facility = await Facility.create(req.body);
    res.status(201).json({ success: true, data: facility });
  } catch (e) { next(e); }
});

export default router;
