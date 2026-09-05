import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { requireAuth, requireRoles, AuthRequest } from "../middleware/auth";
import { Referral } from "../models/Referral";
import { FollowUp, FOLLOW_UP_STATUSES } from "../models/FollowUp";
import { MedicationPlan } from "../models/MedicationPlan";
import { MedicationReminder } from "../models/MedicationReminder";
import { Notification } from "../models/Notification";
import { ReferralEvent } from "../models/ReferralEvent";
import { Consultation } from "../models/Consultation";
import { DiagnosticRecord } from "../models/DiagnosticRecord";

const router = Router();
router.use(requireAuth);
const id = z.string().min(1);

async function referralFor(req: AuthRequest, referralId: string) {
  const referral = await Referral.findById(referralId);
  if (!referral) return null;
  if (req.user?.role === "FACILITY_STAFF" && req.user.facilityId &&
      ![String(referral.toFacilityId), String(referral.fromFacilityId)].includes(req.user.facilityId)) return "forbidden" as const;
  return referral;
}

router.post("/followups", requireRoles("DOCTOR", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      referralId: id, dueDate: z.coerce.date(), purpose: z.string().min(2).max(500),
      requiredFacilityId: id.optional(), assignedAshaWorker: z.string().max(200).optional()
    }).parse(req.body);
    const referral = await referralFor(req, data.referralId);
    if (!referral || referral === "forbidden") return res.status(referral === "forbidden" ? 403 : 404).json({ success: false, error: referral === "forbidden" ? "Not authorized" : "Referral not found" });
    if (!["CONSULTATION_COMPLETED", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED"].includes(referral.status)) return res.status(409).json({ success: false, error: "Follow-up can only be scheduled after clinical review" });
    const followUp = await FollowUp.create({ ...data, referralId: referral._id });
    if (referral.status !== "FOLLOW_UP_REQUIRED") { referral.status = "FOLLOW_UP_REQUIRED"; await referral.save(); }
    res.status(201).json({ success: true, data: followUp });
  } catch (e) { next(e); }
});

router.get("/followups", requireRoles("DOCTOR", "HEALTH_WORKER", "FACILITY_STAFF", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    await FollowUp.updateMany({ dueDate: { $lt: new Date() }, status: { $in: ["UPCOMING", "DUE"] } }, { status: "OVERDUE" });
    const query: Record<string, unknown> = {};
    if (req.query.referralId) query.referralId = req.query.referralId;
    const rows = await FollowUp.find(query).sort({ dueDate: 1 }).limit(200);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

router.patch("/followups/:id", requireRoles("DOCTOR", "HEALTH_WORKER", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ status: z.enum(FOLLOW_UP_STATUSES), notes: z.string().max(1000).optional() }).parse(req.body);
    const followUp = await FollowUp.findById(req.params.id);
    if (!followUp) return res.status(404).json({ success: false, error: "Follow-up not found" });
    followUp.status = data.status;
    followUp.notes = data.notes;
    if (data.status === "COMPLETED") { followUp.completedAt = new Date(); followUp.completedBy = req.user!.id as never; }
    await followUp.save();
    const referral = await Referral.findById(followUp.referralId);
    if (referral && data.status === "COMPLETED") {
      const remaining = await FollowUp.exists({ referralId: referral.id, status: { $nin: ["COMPLETED"] } });
      if (!remaining && referral.status === "FOLLOW_UP_REQUIRED") {
        const previous = referral.status; referral.status = "FOLLOW_UP_COMPLETED"; await referral.save();
        await ReferralEvent.create({ event_id: randomUUID(), referral_id: referral.id, event_type: "STATUS_CHANGED", performed_by: req.user!.id, previous_status: previous, new_status: referral.status, notes: data.notes });
      }
    }
    res.json({ success: true, data: followUp });
  } catch (e) { next(e); }
});

router.post("/medications/plan", requireRoles("DOCTOR", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      referralId: id,
      items: z.array(z.object({
        drugName: z.string().min(1).max(200), dosage: z.string().min(1).max(100),
        frequency: z.string().min(1).max(100), durationDays: z.number().int().min(1).max(3650),
        instructions: z.string().min(1).max(1000), status: z.enum(["ACTIVE", "COMPLETED", "DISCONTINUED"]).optional()
      })).min(1)
    }).parse(req.body);
    const referral = await referralFor(req, data.referralId);
    if (!referral || referral === "forbidden") return res.status(referral === "forbidden" ? 403 : 404).json({ success: false, error: "Referral not found or unauthorized" });
    if (!["CONSULTATION_COMPLETED", "DIAGNOSTIC_COMPLETED", "FOLLOW_UP_REQUIRED"].includes(referral.status)) return res.status(409).json({ success: false, error: "Medication plans require a completed consultation" });
    const plan = await MedicationPlan.create({ referralId: referral._id, prescribedBy: req.user!.id, items: data.items });
    res.status(201).json({ success: true, data: plan });
  } catch (e) { next(e); }
});

router.patch("/medications/plan/:id/sign-off", requireRoles("DOCTOR", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const plan = await MedicationPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, error: "Medication plan not found" });
    plan.signedOff = true; plan.signedOffAt = new Date(); await plan.save();
    res.json({ success: true, data: plan });
  } catch (e) { next(e); }
});

router.post("/medications/reminders", requireRoles("DOCTOR", "HEALTH_WORKER", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ planId: id, scheduledAt: z.coerce.date() }).parse(req.body);
    const plan = await MedicationPlan.findById(data.planId);
    if (!plan) return res.status(404).json({ success: false, error: "Medication plan not found" });
    const reminder = await MedicationReminder.create({ ...data, referralId: plan.referralId });
    res.status(201).json({ success: true, data: reminder });
  } catch (e) { next(e); }
});

router.get("/medications/reminders", requireRoles("DOCTOR", "HEALTH_WORKER", "ADMIN", "FACILITY_STAFF"), async (req: AuthRequest, res, next) => {
  try {
    const reminders = await MedicationReminder.find(req.query.planId ? { planId: String(req.query.planId) } : {}).sort({ scheduledAt: 1 }).limit(200);
    res.json({ success: true, data: reminders });
  } catch (e) { next(e); }
});

router.patch("/medications/reminders/:id", requireRoles("HEALTH_WORKER", "DOCTOR", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ status: z.enum(["SCHEDULED", "TAKEN", "SKIPPED", "SNOOZED"]), reason: z.string().max(500).optional(), snoozedUntil: z.coerce.date().optional() }).parse(req.body);
    if (data.status === "SKIPPED" && !data.reason?.trim()) return res.status(400).json({ success: false, error: "A reason is required when skipping a reminder" });
    const reminder = await MedicationReminder.findByIdAndUpdate(req.params.id, { ...data, updatedBy: req.user!.id }, { new: true, runValidators: true });
    if (!reminder) return res.status(404).json({ success: false, error: "Medication reminder not found" });
    res.json({ success: true, data: reminder });
  } catch (e) { next(e); }
});

router.post("/referrals/:id/consultation", requireRoles("DOCTOR", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ notes: z.string().min(3).max(5000) }).parse(req.body);
    const referral = await referralFor(req, String(req.params.id));
    if (!referral || referral === "forbidden") return res.status(404).json({ success: false, error: "Referral not found" });
    if (referral.status !== "PATIENT_ARRIVED") return res.status(409).json({ success: false, error: "Patient must be marked arrived first" });
    const previous = referral.status;
    await Consultation.findOneAndUpdate({ referralId: referral.id }, { referralId: referral.id, clinicianId: req.user!.id, notes: data.notes, completedAt: new Date() }, { upsert: true, new: true, runValidators: true });
    referral.status = "CONSULTATION_COMPLETED"; referral.clinicalNotes = data.notes; referral.consultationCompletedAt = new Date(); await referral.save();
    await ReferralEvent.create({ event_id: randomUUID(), referral_id: referral.id, event_type: "CONSULTATION_COMPLETED", performed_by: req.user!.id, previous_status: previous, new_status: referral.status, notes: data.notes });
    res.json({ success: true, data: referral });
  } catch (e) { next(e); }
});

router.post("/referrals/:id/diagnostics", requireRoles("DOCTOR", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ tests: z.array(z.object({ name: z.string().min(1).max(200), result: z.string().max(2000).optional() })).min(1) }).parse(req.body);
    const referral = await referralFor(req, String(req.params.id));
    if (!referral || referral === "forbidden") return res.status(404).json({ success: false, error: "Referral not found" });
    if (referral.status === "CONSULTATION_COMPLETED") referral.status = "DIAGNOSTIC_PENDING";
    if (referral.status !== "DIAGNOSTIC_PENDING") return res.status(409).json({ success: false, error: "Diagnostics require a completed consultation" });
    const tests = data.tests.map((test) => ({ ...test, orderedAt: new Date(), status: test.result ? "COMPLETED" : "PENDING" as const }));
    await DiagnosticRecord.create({ referralId: referral.id, orderedBy: req.user!.id, tests });
    await ReferralEvent.create({ event_id: randomUUID(), referral_id: referral.id, event_type: "DIAGNOSTIC_ORDERED", performed_by: req.user!.id, previous_status: "CONSULTATION_COMPLETED", new_status: "DIAGNOSTIC_PENDING" });
    referral.set("diagnosticOrders", tests);
    await referral.save();
    res.json({ success: true, data: referral });
  } catch (e) { next(e); }
});

router.patch("/referrals/:id/diagnostics", requireRoles("DOCTOR", "ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ tests: z.array(z.object({ name: z.string().min(1).max(200), result: z.string().min(1).max(2000) })).min(1) }).parse(req.body);
    const referral = await referralFor(req, String(req.params.id));
    if (!referral || referral === "forbidden") return res.status(404).json({ success: false, error: "Referral not found" });
    if (referral.status !== "DIAGNOSTIC_PENDING") return res.status(409).json({ success: false, error: "Referral is not awaiting diagnostics" });
    const tests = data.tests.map((test) => ({ ...test, orderedAt: new Date(), status: "COMPLETED" as const }));
    await DiagnosticRecord.create({ referralId: referral.id, orderedBy: req.user!.id, tests });
    const previous = referral.status;
    referral.set("diagnosticOrders", tests);
    referral.status = "DIAGNOSTIC_COMPLETED"; referral.diagnosticsCompletedAt = new Date(); await referral.save();
    await ReferralEvent.create({ event_id: randomUUID(), referral_id: referral.id, event_type: "DIAGNOSTIC_COMPLETED", performed_by: req.user!.id, previous_status: previous, new_status: referral.status });
    res.json({ success: true, data: referral });
  } catch (e) { next(e); }
});

router.get("/notifications", requireRoles("ADMIN", "DOCTOR", "HEALTH_WORKER", "FACILITY_STAFF"), async (req: AuthRequest, res, next) => {
  try {
    const unreadOnly = String(req.query.unread ?? "false") === "true";
    const notifications = await Notification.find({ userId: req.user!.id, ...(unreadOnly ? { read: false } : {}) }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: notifications.map((notification) => ({ ...notification.toObject(), id: notification.id, timestamp: notification.createdAt })) });
  } catch (e) { next(e); }
});

router.patch("/notifications/:id/read", requireRoles("ADMIN", "DOCTOR", "HEALTH_WORKER", "FACILITY_STAFF"), async (req: AuthRequest, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user!.id }, { read: true, readAt: new Date() }, { new: true });
    if (!notification) return res.status(404).json({ success: false, error: "Notification not found" });
    res.json({ success: true, data: notification });
  } catch (e) { next(e); }
});

router.patch("/notifications/read-all", requireRoles("ADMIN", "DOCTOR", "HEALTH_WORKER", "FACILITY_STAFF"), async (req: AuthRequest, res, next) => {
  try { await Notification.updateMany({ userId: req.user!.id, read: false }, { read: true, readAt: new Date() }); res.json({ success: true, data: null }); } catch (e) { next(e); }
});

router.get("/dashboard/stats", requireRoles("ADMIN", "DOCTOR", "FACILITY_STAFF", "HEALTH_WORKER"), async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role === "FACILITY_STAFF" && !req.user.facilityId) return res.status(403).json({ success: false, error: "Facility assignment is required" });
    await FollowUp.updateMany({ dueDate: { $lt: new Date() }, status: { $in: ["UPCOMING", "DUE"] } }, { status: "OVERDUE" });
    const filter = req.user?.role === "FACILITY_STAFF" && req.user.facilityId ? { $or: [{ toFacilityId: req.user.facilityId }, { fromFacilityId: req.user.facilityId }] } : {};
    const referrals = await Referral.find(filter).select("status priority careLevel fromFacilityId toFacilityId createdAt updatedAt");
    const count = (status: string) => referrals.filter((r) => r.status === status).length;
    const closed = count("CLOSED");
    const active = referrals.filter((r) => !["CLOSED", "CANCELLED", "LOST_TO_FOLLOWUP"].includes(r.status)).length;
    const overdue = referrals.filter((r) => ["OVERDUE", "LOST_TO_FOLLOWUP"].includes(r.status)).length;
    const hours = referrals.length ? referrals.reduce((sum, r) => sum + ((r.updatedAt.getTime() - r.createdAt.getTime()) / 3600000), 0) / referrals.length : 0;
    const followUps = await FollowUp.find({ referralId: { $in: referrals.map((referral) => referral._id) }, status: { $in: ["DUE", "OVERDUE", "MISSED"] }, dueDate: { $lt: new Date() } }).limit(100);
    const performanceMap = new Map<string, { total: number; closed: number }>();
    referrals.forEach((referral) => {
      const key = String(referral.toFacilityId);
      const current = performanceMap.get(key) ?? { total: 0, closed: 0 };
      current.total += 1; if (referral.status === "CLOSED") current.closed += 1;
      performanceMap.set(key, current);
    });
    res.json({ success: true, data: {
      totalReferrals: referrals.length, activeInTransit: active, closedLoops: closed,
      closureRate: referrals.length ? Math.round((closed / referrals.length) * 100) : 0,
      overdueCount: overdue + followUps.length, lostToFollowUp: count("LOST_TO_FOLLOWUP"),
      leakageRate: referrals.length ? Math.round((overdue / referrals.length) * 100) : 0,
      avgTransferTimeHours: Math.round(hours * 10) / 10,
      priorityBreakdown: { high: referrals.filter((r) => r.priority === "HIGH").length, medium: referrals.filter((r) => r.priority === "MEDIUM").length, low: referrals.filter((r) => r.priority === "LOW").length },
      careLevelBreakdown: { phc: referrals.filter((r) => r.careLevel === "PHC").length, district: referrals.filter((r) => r.careLevel === "DISTRICT").length, tertiary: referrals.filter((r) => r.careLevel === "TERTIARY").length },
      facilityPerformance: Array.from(performanceMap, ([facilityId, value]) => ({ facilityId, ...value, closureRate: value.total ? Math.round(value.closed / value.total * 100) : 0 }))
    } });
  } catch (e) { next(e); }
});

router.get("/dashboard/overdue", requireRoles("ADMIN", "DOCTOR", "FACILITY_STAFF", "HEALTH_WORKER"), async (req: AuthRequest, res, next) => {
  try {
    if (req.user?.role === "FACILITY_STAFF" && !req.user.facilityId) return res.status(403).json({ success: false, error: "Facility assignment is required" });
    const filter = req.user?.role === "FACILITY_STAFF" && req.user.facilityId ? { $and: [{ status: { $in: ["OVERDUE", "LOST_TO_FOLLOWUP"] } }, { $or: [{ toFacilityId: req.user.facilityId }, { fromFacilityId: req.user.facilityId }] }] } : { status: { $in: ["OVERDUE", "LOST_TO_FOLLOWUP"] } };
    const rows = await Referral.find(filter).sort({ updatedAt: 1 }).limit(100);
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
});

export default router;
