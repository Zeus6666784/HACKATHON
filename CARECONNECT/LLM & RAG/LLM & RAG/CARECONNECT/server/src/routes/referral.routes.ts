import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";
import { Referral, REFERRAL_STATES } from "../models/Referral";
import { ReferralEvent } from "../models/ReferralEvent";

const router = Router();
router.use(requireAuth);

const transitions: Record<string, string[]> = {
  CREATED: ["TRIAGED", "CANCELLED"],
  TRIAGED: ["FACILITY_SELECTED", "CANCELLED"],
  FACILITY_SELECTED: ["REFERRAL_SENT", "CANCELLED"],
  REFERRAL_SENT: ["REFERRAL_ACCEPTED", "REFERRAL_REJECTED"],
  REFERRAL_ACCEPTED: ["PATIENT_ARRIVED"],
  REFERRAL_REJECTED: [],
  PATIENT_ARRIVED: ["CONSULTATION_COMPLETED"],
  CONSULTATION_COMPLETED: ["DIAGNOSTIC_PENDING", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED", "CLOSED"],
  DIAGNOSTIC_PENDING: ["DIAGNOSTIC_COMPLETED"],
  DIAGNOSTIC_COMPLETED: ["FOLLOW_UP_REQUIRED", "CLOSED"],
  FOLLOW_UP_REQUIRED: ["FOLLOW_UP_COMPLETED", "OVERDUE", "LOST_TO_FOLLOWUP"],
  FOLLOW_UP_COMPLETED: ["CLOSED"],
  OVERDUE: ["FOLLOW_UP_COMPLETED", "LOST_TO_FOLLOWUP"],
  LOST_TO_FOLLOWUP: ["CLOSED"],
  CANCELLED: [],
  CLOSED: []
};

router.post("/", requireRoles("DOCTOR", "HEALTH_WORKER"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      referralId: z.string().min(2),
      patientId: z.string(),
      fromFacilityId: z.string(),
      toFacilityId: z.string(),
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
      careLevel: z.enum(["PHC", "DISTRICT", "TERTIARY"])
    }).parse(req.body);

    const referral = await Referral.create(data);
    await ReferralEvent.create({
      event_id: crypto.randomUUID(),
      referral_id: referral.id,
      event_type: "REFERRAL_CREATED",
      performed_by: req.user!.id,
      previous_status: undefined,
      new_status: "CREATED",
      notes: "Referral created"
    });

    res.status(201).json({ success: true, data: referral });
  } catch (e) { next(e); }
});

router.get("/", requireRoles("DOCTOR", "FACILITY_STAFF", "ADMIN"), async (_req, res, next) => {
  try {
    const referrals = await Referral.find().sort({ updatedAt: -1 }).limit(100);
    res.json({ success: true, data: referrals });
  } catch (e) { next(e); }
});

router.get("/:id", requireRoles("DOCTOR", "FACILITY_STAFF", "ADMIN"), async (req, res, next) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ success: false, error: "Referral not found" });
    const events = await ReferralEvent.find({ referral_id: referral.id }).sort({ timestamp: 1 });
    res.json({ success: true, data: { referral, events } });
  } catch (e) { next(e); }
});

router.patch("/:id/status", requireRoles("DOCTOR", "FACILITY_STAFF"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      status: z.enum(REFERRAL_STATES),
      notes: z.string().max(1000).optional()
    }).parse(req.body);

    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ success: false, error: "Referral not found" });

    const allowed = transitions[referral.status] ?? [];
    if (!allowed.includes(data.status)) {
      return res.status(409).json({ success: false, error: `Invalid transition from ${referral.status} to ${data.status}` });
    }

    const previous = referral.status;
    referral.status = data.status;
    await referral.save();

    await ReferralEvent.create({
      event_id: crypto.randomUUID(),
      referral_id: referral.id,
      event_type: "STATUS_CHANGED",
      performed_by: req.user!.id,
      previous_status: previous,
      new_status: data.status,
      notes: data.notes
    });

    res.json({ success: true, data: referral });
  } catch (e) { next(e); }
});

export default router;
