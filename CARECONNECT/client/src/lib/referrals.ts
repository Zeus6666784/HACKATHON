import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { NEXT_STATUS, STATUS_ORDER, type ReferralStatus } from "./constants";
import { writeAudit } from "./audit";

const OPEN_STATUSES: ReferralStatus[] = [
  "CREATED",
  "TRIAGED",
  "REFERRED",
  "APPOINTMENT",
  "CONSULTATION",
  "FOLLOW_UP",
];

export function isOverdue(updatedAt: Date, status: string, dueAt?: Date | null) {
  if (status === "CLOSED") return false;
  if (dueAt && dueAt.getTime() < Date.now()) return true;
  return Date.now() - updatedAt.getTime() > 72 * 60 * 60 * 1000;
}

export function isCompletedJourney(status: string) {
  return STATUS_ORDER[status as ReferralStatus] >= STATUS_ORDER.CONSULTATION;
}

export async function dashboardStats() {
  const referrals = await prisma.referral.findMany({
    select: { status: true, updatedAt: true, dueAt: true, closedAt: true },
  });
  const total = referrals.length;
  const closed = referrals.filter((r: any) => r.status === "CLOSED").length;
  const pending = referrals.filter((r: any) => r.status !== "CLOSED").length;
  const overdue = referrals.filter((r: any) => isOverdue(r.updatedAt, r.status, r.dueAt)).length;
  const completed = referrals.filter((r: any) => isCompletedJourney(r.status)).length;
  const closureRate = total === 0 ? 0 : Math.round((closed / total) * 1000) / 10;
  return { total, closed, pending, overdue, completed, closureRate };
}

export async function advanceReferral(opts: {
  referralId: string;
  actorName: string;
  userId?: string;
  note?: string;
  extra?: any;
}) {
  const referral = await prisma.referral.findUnique({ where: { id: opts.referralId } });
  if (!referral) throw new Error("NOT_FOUND");
  const current = referral.status as ReferralStatus;
  const next = NEXT_STATUS[current];
  if (!next) throw new Error("ALREADY_CLOSED");

  const data: any = {
    status: next,
    ...(opts.extra ?? {}),
  };
  if (opts.note) {
    if (next === "APPOINTMENT") data.appointmentAt = data.appointmentAt ?? new Date();
    if (next === "CONSULTATION") data.consultationNotes = opts.note;
    if (next === "FOLLOW_UP") data.diagnosticsNotes = opts.note;
    if (next === "CLOSED") data.closureNotes = opts.note;
  }
  if (next === "CLOSED") data.closedAt = new Date();
  if (next === "FOLLOW_UP" && !referral.dueAt) {
    data.dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const updated = await prisma.referral.update({
    where: { id: referral.id },
    data,
  });
  await prisma.referralEvent.create({
    data: {
      referralId: referral.id,
      fromStatus: current,
      toStatus: next,
      actorName: opts.actorName,
      note: opts.note || `Moved to ${next}`,
    },
  });
  await writeAudit({
    userId: opts.userId,
    action: "ADVANCE_REFERRAL",
    entity: "Referral",
    entityId: referral.id,
    detail: `${current} -> ${next}`,
  });
  return updated;
}

export { OPEN_STATUSES };
