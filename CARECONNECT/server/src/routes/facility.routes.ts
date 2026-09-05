import { Router } from "express";
import { Facility } from "../models/Facility";
import { Patient } from "../models/Patient";
import { calculateDistance } from "../utils/geo";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";
import { z } from "zod";

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
    const query = z.object({
      patientId: z.string(),
      symptoms: z.string().optional(),
      isEmergency: z.enum(["true", "false"]).optional()
    }).parse(req.query);

    const patient = await Patient.findById(query.patientId);
    if (!patient) return res.status(404).json({ success: false, error: "Patient not found" });

    if (!req.user?.facilityId || String(patient.facilityId) !== String(req.user.facilityId)) {
      return res.status(403).json({ success: false, error: "You are not authorized to access this patient's data" });
    }

    const symptoms = String(query.symptoms ?? "").toLowerCase();
    const isEmergency = query.isEmergency === "true";
    const facilities = await Facility.find();

    const ranked = facilities.map((f) => {
      // 1. Capability Match (C)
      let C = 0;
      if (symptoms) {
        const hasExactMatch = f.services.some((s: string) => symptoms.includes(s.toLowerCase()));
        C = hasExactMatch ? 100 : 50; // Simplified: 50 for general care, 100 for exact match
        if (!hasExactMatch && f.services.length === 0) C = 0;
      } else {
        C = 50;
      }

      // 2. Care Level Match (L)
      // Assume we know required care level from symptoms or triage, but here we use a default
      // For now, let's assume requiredCareLevel is passed or inferred.
      // Since it's not in query, we'll use a naive check: if it's emergency, we prefer Tertiary/District.
      let L = 50; // Default to "Correct Level"
      if (isEmergency && f.type === "PHC" && !f.emergencyCapability) L = 0; // Disqualified

      // 3. Distance Factor (D)
      const dist = calculateDistance(patient.coordinates || [0, 0], f.coordinates);
      const D = Math.max(0, 100 - (dist * 2)); // penalty_rate = 2km per point

      // 4. Verification Status (V)
      let V = 1.0;
      if (f.verificationState === "VERIFIED") V = 1.2;
      else if (f.verificationState === "UNKNOWN") V = 0.8;
      else if (f.verificationState === "SYNTHETIC") V = 1.0;

      const score = (C + L + D) * V;

      // Disqualification
      if (C === 0 || L === 0) return null;

      return {
        facility: f,
        score,
        distance: dist,
        explanation: `Score ${score.toFixed(1)}: ${C >= 100 ? "Exact service match" : "General care"}, ${f.verificationState} data, ${dist.toFixed(1)}km away.`
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.score - a.score);

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
