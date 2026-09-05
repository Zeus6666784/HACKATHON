import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { triageSchema } from "@/lib/validations";
import { runTriage } from "@/lib/triage";
import { makeReferralId } from "@/lib/ids";
import { writeAudit } from "@/lib/audit";
import { ROLES } from "@/lib/constants";
import { isOverdue } from "@/lib/referrals";

export async function GET() {
  try {
    const session = await requireSession();
    const where =
      session.role === ROLES.PATIENT
        ? { patient: { accountUserId: session.id } }
        : session.role === ROLES.FACILITY_STAFF && session.facilityId
          ? { OR: [{ toFacilityId: session.facilityId }, { fromFacilityId: session.facilityId }] }
          : {};
    const referrals = await prisma.referral.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        patient: true,
        toFacility: true,
        fromFacility: true,
      },
    });
    return NextResponse.json({
      referrals: referrals.map((r) => ({
        ...r,
        overdue: isOverdue(r.updatedAt, r.status, r.dueAt),
      })),
    });
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    if (session.role === ROLES.PATIENT) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = triageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION", details: parsed.error.flatten() }, { status: 400 });
    }
    const patient = await prisma.patient.findUnique({ where: { id: parsed.data.patientId } });
    if (!patient) return NextResponse.json({ error: "PATIENT_NOT_FOUND" }, { status: 404 });

    const triage = await runTriage({
      chiefComplaint: parsed.data.chiefComplaint,
      dangerSigns: parsed.data.dangerSigns,
      requiredService: parsed.data.requiredService,
      vitals: { ...parsed.data.vitals, age: parsed.data.vitals?.age ?? patient.age },
    });

    const referral = await prisma.referral.create({
      data: {
        publicId: makeReferralId(),
        patientId: patient.id,
        createdById: session.id,
        fromFacilityId: session.facilityId,
        status: "TRIAGED",
        priority: triage.priority,
        requiredService: parsed.data.requiredService,
        chiefComplaint: parsed.data.chiefComplaint,
        dangerSigns: parsed.data.dangerSigns.join(","),
        triageRationale: triage.rationale,
        recommendedLevel: triage.recommendedLevel,
        isSynthetic: true,
      },
      include: { patient: true, fromFacility: true },
    });

    await prisma.referralEvent.createMany({
      data: [
        {
          referralId: referral.id,
          fromStatus: null,
          toStatus: "CREATED",
          actorName: session.fullName,
          note: "First contact registered. Continuity tracking started.",
        },
        {
          referralId: referral.id,
          fromStatus: "CREATED",
          toStatus: "TRIAGED",
          actorName: session.fullName,
          note: `Priority ${triage.priority} only. Recommended public care level ${triage.recommendedLevel}. No diagnosis.`,
        },
      ],
    });
    await writeAudit({
      userId: session.id,
      action: "CREATE_REFERRAL",
      entity: "Referral",
      entityId: referral.id,
      detail: referral.publicId,
    });
    return NextResponse.json({ referral, triage });
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
