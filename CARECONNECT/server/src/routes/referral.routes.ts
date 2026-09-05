import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";
import { Referral, REFERRAL_STATES } from "../models/Referral";
import { ReferralEvent } from "../models/ReferralEvent";
import mongoose from "mongoose";
import { notificationService } from "../services/notification.service";

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

    // IDOR check: ensuring fromFacilityId matches user's facility
    if (req.user?.role !== "ADMIN" && String(data.fromFacilityId) !== String(req.user?.facilityId)) {
      return res.status(403).json({ success: false, error: "You can only create referrals from your own facility" });
    }

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

router.get("/stats", requireRoles("DOCTOR", "FACILITY_STAFF", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const filter = req.user?.role === "ADMIN"
      ? {}
      : { $or: [{ fromFacilityId: req.user?.facilityId }, { toFacilityId: req.user?.facilityId }] };

    const referrals = await Referral.find(filter);
    const stats = {
      total: referrals.length,
      byStatus: {} as Record<string, number>,
      overdue: 0
    };

    const now = new Date();
    referrals.forEach(r => {
      stats.byStatus[r.status] = (stats.byStatus[r.status] || 0) + 1;

      // Overdue logic
      const updatedAt = new Date(r.updatedAt);
      const diffDays = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);

      if ((r.status === "FOLLOW_UP_REQUIRED" && diffDays > 7) ||
          (r.status === "REFERRAL_SENT" && diffDays > 3)) {
        stats.overdue++;
      }
    });

    res.json({ success: true, data: stats });
  } catch (e) { next(e); }
});

router.get("/", requireRoles("DOCTOR", "FACILITY_STAFF", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const filter = req.user?.role === "ADMIN"
      ? {}
      : { $or: [{ fromFacilityId: req.user?.facilityId }, { toFacilityId: req.user?.facilityId }] };

    const referrals = await Referral.find(filter).sort({ updatedAt: -1 }).limit(100);
    res.json({ success: true, data: referrals });
  } catch (e) { next(e); }
});

router.get("/:id", requireRoles("DOCTOR", "FACILITY_STAFF", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ success: false, error: "Referral not found" });

    if (req.user?.role !== "ADMIN" &&
        String(referral.fromFacilityId) !== String(req.user?.facilityId) &&
        String(referral.toFacilityId) !== String(req.user?.facilityId)) {
      return res.status(403).json({ success: false, error: "You are not authorized to view this referral" });
    }

    const events = await ReferralEvent.find({ referral_id: referral.id }).sort({ timestamp: 1 });
    res.json({ success: true, data: { referral, events } });
  } catch (e) { next(e); }
});

router.patch("/:id/reassign", requireRoles("DOCTOR", "HEALTH_WORKER"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      toFacilityId: z.string(),
      notes: z.string().optional()
    }).parse(req.body);

    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ success: false, error: "Referral not found" });

    // Only the original facility can reassign if not yet accepted
    if (req.user?.role !== "ADMIN" && String(referral.fromFacilityId) !== String(req.user?.facilityId)) {
      return res.status(403).json({ success: false, error: "Only the referring facility can reassign" });
    }

    if (referral.status === "REFERRAL_ACCEPTED" || referral.status === "CLOSED") {
      return res.status(409).json({ success: false, error: "Cannot reassign an accepted or closed referral" });
    }

    const previousStatus = referral.status;
    referral.toFacilityId = data.toFacilityId;
    referral.status = "FACILITY_SELECTED"; // Reset to selection state

    await referral.save();

    await ReferralEvent.create({
      event_id: crypto.randomUUID(),
      referral_id: referral.id,
      event_type: "REFERRAL_REASSIGNED",
      performed_by: req.user!.id,
      previous_status: previousStatus,
      new_status: "FACILITY_SELECTED",
      notes: `Reassigned to ${data.toFacilityId}. ${data.notes ?? ""}`
    });

    res.json({ success: true, data: referral });
  } catch (e) { next(e); }
});

router.patch("/:id/close", requireRoles("DOCTOR"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      medication: z.string().optional(),
      followUpDate: z.string().optional(),
      closureNotes: z.string().min(1)
    }).parse(req.body);

    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ success: false, error: "Referral not found" });

    if (referral.status === "CLOSED") {
      return res.status(409).json({ success: false, error: "Referral is already closed" });
    }

    const previousStatus = referral.status;
    referral.status = "CLOSED";
    await referral.save();

    await ReferralEvent.create({
      event_id: crypto.randomUUID(),
      referral_id: referral.id,
      event_type: "REFERRAL_CLOSED",
      performed_by: req.user!.id,
      previous_status: previousStatus,
      new_status: "CLOSED",
      notes: `Closed. Meds: ${data.medication ?? "None"}. Follow-up: ${data.followUpDate ?? "None"}. Notes: ${data.closureNotes}`
    });

    res.json({ success: true, data: referral });
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

    // IDOR check: Only the destination facility can accept/reject or update status once sent
    if (req.user?.role !== "ADMIN" &&
        String(referral.toFacilityId) !== String(req.user?.facilityId) &&
        String(referral.fromFacilityId) !== String(req.user?.facilityId)) {
      return res.status(403).json({ success: false, error: "You are not authorized to update this referral" });
    }

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

    await notificationService.notifyReferralStatus(referral.id, data.status, referral.toFacilityId?.toString() || "Unknown");

    res.json({ success: true, data: referral });
  } catch (e) { next(e); }
});

export default router;
