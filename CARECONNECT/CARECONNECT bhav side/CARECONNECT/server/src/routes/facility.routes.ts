import { Router } from "express";
import { Facility } from "../models/Facility";
import { requireAuth, requireRoles } from "../middleware/auth";
import { FacilityRankingService } from "../services/facilityRanking.service";
import { AuthRequest } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/", async (_req, res, next) => {
  try {
    const facilities = await Facility.find().limit(200);
    res.json({ success: true, data: facilities });
  } catch (e) { next(e); }
});

router.get("/rank", requireRoles("DOCTOR", "HEALTH_WORKER"), async (req: AuthRequest, res, next) => {
  try {
    const symptoms = String(req.query.symptoms ?? "").toLowerCase();
    const isEmergency = String(req.query.isEmergency ?? "false") === "true";

    // Use user location if available, otherwise default to a central Maharashtra point (e.g., Pune)
    const userLocation: [number, number] = req.user?.location
      ? [Number(req.user.location.lat), Number(req.user.location.lng)]
      : [18.5204, 73.8567];

    const ranked = await FacilityRankingService.rankFacilities({
      symptoms,
      isEmergency,
      userLocation
    });

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
