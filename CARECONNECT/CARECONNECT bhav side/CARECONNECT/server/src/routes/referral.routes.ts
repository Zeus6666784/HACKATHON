import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";
import { Referral, REFERRAL_STATES } from "../models/Referral";
import { ReferralEvent } from "../models/ReferralEvent";
import { FollowUp } from "../models/FollowUp";
import { MedicationPlan } from "../models/MedicationPlan";
import { Notification } from "../models/Notification";

const router = Router();
router.use(requireAuth);

export const transitions: Record<string, string[]> = {
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

const idSchema = z.string().min(1);

async function event(referral: { id?: unknown; _id?: unknown; status: string; toFacilityId?: unknown }, userId: string, previous: string | undefined, next: string, notes?: string, eventType = "STATUS_CHANGED") {
  await ReferralEvent.create({
    event_id: randomUUID(), referral_id: String(referral.id ?? referral._id), event_type: eventType,
    performed_by: userId, facility_id: referral.toFacilityId,
    previous_status: previous, new_status: next, notes
  });
}

async function notifyUsers(referral: { id?: unknown; _id?: unknown; fromFacilityId?: unknown; toFacilityId?: unknown }, title: string, message: string, type: "URGENT" | "INFO" | "SUCCESS" | "WARNING") {
  // Notifications are addressed by facility through the User collection in the route
  // callers. Keeping this helper small prevents notification writes from changing state.
  const { User } = await import("../models/User");
  const facilityIds = [referral.fromFacilityId, referral.toFacilityId].filter(Boolean).map(String);
  const users = await User.find({ facilityId: { $in: facilityIds } }).select("_id");
  if (users.length) await Notification.insertMany(users.map((u) => ({ userId: u._id, referralId: String(referral.id ?? referral._id), title, message, type })));
}

router.post("/", requireRoles("DOCTOR", "HEALTH_WORKER"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      referralId: z.string().min(2).max(80),
      patientId: idSchema,
      fromFacilityId: idSchema,
      toFacilityId: idSchema,
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
      careLevel: z.enum(["PHC", "DISTRICT", "TERTIARY"]),
      chiefComplaint: z.string().max(2000).optional()
    }).parse(req.body);
    const referral = await Referral.create(data);
    await event(referral, req.user!.id, undefined, "CREATED", "Referral created", "REFERRAL_CREATED");
    await notifyUsers(referral, "New referral", `Referral ${referral.referralId} is waiting for facility review.`, "INFO");
    res.status(201).json({ success: true, data: referral });
  } catch (e) { next(e); }
});

router.get("/", requireRoles("DOCTOR", "FACILITY_STAFF", "ADMIN", "HEALTH_WORKER"), async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role === "FACILITY_STAFF" && !req.user.facilityId) return res.status(403).json({ success: false, error: "Facility assignment is required" });
    const filter = req.user?.role === "FACILITY_STAFF" && req.user.facilityId
      ? { $or: [{ toFacilityId: req.user.facilityId }, { fromFacilityId: req.user.facilityId }] } : {};
    const referrals = await Referral.find(filter).sort({ updatedAt: -1 }).limit(100);
    res.json({ success: true, data: referrals });
  } catch (e) { next(e); }
});

router.get("/:id", requireRoles("DOCTOR", "FACILITY_STAFF", "ADMIN", "HEALTH_WORKER"), async (req: AuthRequest, res, next) => {
  try {
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ success: false, error: "Referral not found" });
    if (req.user?.role === "FACILITY_STAFF" && !req.user.facilityId) return res.status(403).json({ success: false, error: "Facility assignment is required" });
    if (req.user?.role === "FACILITY_STAFF" && req.user.facilityId && ![String(referral.toFacilityId), String(referral.fromFacilityId)].includes(req.user.facilityId)) {
      return res.status(403).json({ success: false, error: "Referral is outside your facility" });
    }
    const [events, followUps, medicationPlans] = await Promise.all([
      ReferralEvent.find({ referral_id: referral.id }).sort({ timestamp: 1 }),
      FollowUp.find({ referralId: referral.id }).sort({ dueDate: 1 }),
      MedicationPlan.find({ referralId: referral.id }).sort({ createdAt: -1 })
    ]);
    res.json({ success: true, data: { referral, events, followUps, medicationPlans } });
  } catch (e) { next(e); }
});

router.patch("/:id/status", requireRoles("DOCTOR", "FACILITY_STAFF", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ status: z.enum(REFERRAL_STATES), notes: z.string().max(1000).optional() }).parse(req.body);
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ success: false, error: "Referral not found" });
    if (req.user?.role === "FACILITY_STAFF" && !req.user.facilityId) return res.status(403).json({ success: false, error: "Facility assignment is required" });
    if (req.user?.role === "FACILITY_STAFF" && req.user.facilityId && String(referral.toFacilityId) !== req.user.facilityId) {
      return res.status(403).json({ success: false, error: "Only the receiving facility may update this referral" });
    }
    if (["REFERRAL_ACCEPTED", "REFERRAL_REJECTED"].includes(data.status) && !data.notes?.trim()) return res.status(400).json({ success: false, error: "A decision reason is required" });
    if (data.status === "CONSULTATION_COMPLETED" && !data.notes?.trim()) return res.status(400).json({ success: false, error: "Consultation notes are required" });
    if (data.status === "REFERRAL_ACCEPTED" && req.user?.role !== "FACILITY_STAFF" && req.user?.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "Only receiving facility staff may accept a referral" });
    }
    if (data.status === "PATIENT_ARRIVED" && !["FACILITY_STAFF", "ADMIN"].includes(req.user!.role)) {
      return res.status(403).json({ success: false, error: "Only facility staff may record arrival" });
    }
    if (["CONSULTATION_COMPLETED", "DIAGNOSTIC_PENDING", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED", "FOLLOW_UP_COMPLETED", "CLOSED"].includes(data.status) && !["DOCTOR", "ADMIN"].includes(req.user!.role)) {
      return res.status(403).json({ success: false, error: "A doctor must record clinical care" });
    }
    if (!(transitions[referral.status] ?? []).includes(data.status)) return res.status(409).json({ success: false, error: `Invalid transition from ${referral.status} to ${data.status}` });
    if (data.status === "CLOSED") {
      const [pendingFollowUp, activePlan] = await Promise.all([
        FollowUp.exists({ referralId: referral.id, status: { $nin: ["COMPLETED"] } }),
        MedicationPlan.exists({ referralId: referral.id, signedOff: false })
      ]);
      if (pendingFollowUp || activePlan) return res.status(409).json({ success: false, error: "Complete all follow-ups and sign off medication plans before closure" });
      if (!data.notes?.trim()) return res.status(400).json({ success: false, error: "Closure outcome is required" });
      referral.closureOutcome = data.notes;
      referral.closureSignedOff = true;
    }
    if (data.status === "FOLLOW_UP_COMPLETED") {
      const incomplete = await FollowUp.exists({ referralId: referral.id, status: { $nin: ["COMPLETED"] } });
      if (incomplete) return res.status(409).json({ success: false, error: "Complete every follow-up before marking the referral complete" });
    }
    const previous = referral.status;
    referral.status = data.status;
    if (data.status === "REFERRAL_REJECTED") referral.rejectionReason = data.notes;
    if (data.status === "CONSULTATION_COMPLETED") { referral.clinicalNotes = data.notes; referral.consultationCompletedAt = new Date(); }
    if (data.status === "DIAGNOSTIC_COMPLETED") referral.diagnosticsCompletedAt = new Date();
    await referral.save();
    await event(referral, req.user!.id, previous, data.status, data.notes);
    const titles: Record<string, [string, string, "URGENT" | "INFO" | "SUCCESS" | "WARNING"]> = {
      REFERRAL_ACCEPTED: ["Referral accepted", `Referral ${referral.referralId} was accepted.`, "SUCCESS"],
      PATIENT_ARRIVED: ["Patient arrived", `Patient for ${referral.referralId} has arrived.`, "INFO"],
      CLOSED: ["Referral closed", `Referral ${referral.referralId} completed care.`, "SUCCESS"],
      OVERDUE: ["Referral overdue", `Referral ${referral.referralId} needs attention.`, "WARNING"]
    };
    if (titles[data.status]) await notifyUsers(referral, ...titles[data.status]);
    res.json({ success: true, data: referral });
  } catch (e) { next(e); }
});

router.post("/:id/reassign", requireRoles("DOCTOR", "HEALTH_WORKER", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ toFacilityId: idSchema, reason: z.string().min(3).max(1000) }).parse(req.body);
    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ success: false, error: "Referral not found" });
    if (referral.status !== "REFERRAL_REJECTED") return res.status(409).json({ success: false, error: "Only rejected referrals can be reassigned" });
    const previousFacility = referral.toFacilityId;
    referral.toFacilityId = data.toFacilityId as never;
    referral.status = "REFERRAL_SENT";
    referral.rejectionReason = undefined;
    await referral.save();
    await event(referral, req.user!.id, "REFERRAL_REJECTED", "REFERRAL_SENT", `${data.reason} (from ${String(previousFacility)})`, "REASSIGNMENT");
    await notifyUsers(referral, "Referral reassigned", `Referral ${referral.referralId} was reassigned to your facility.`, "INFO");
    res.json({ success: true, data: referral });
  } catch (e) { next(e); }
});

export default router;
