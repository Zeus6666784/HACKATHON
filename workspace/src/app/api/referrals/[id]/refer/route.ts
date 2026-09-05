import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { referSchema } from "@/lib/validations";
import { writeAudit } from "@/lib/audit";
import { ROLES } from "@/lib/constants";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    if (session.role === ROLES.PATIENT) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = referSchema.safeParse({ ...body, referralId: id });
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
    }
    const referral = await prisma.referral.findUnique({ where: { id } });
    if (!referral) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (referral.status !== "TRIAGED" && referral.status !== "CREATED") {
      return NextResponse.json({ error: "INVALID_STATUS" }, { status: 409 });
    }
    const facility = await prisma.facility.findUnique({ where: { id: parsed.data.toFacilityId } });
    if (!facility) return NextResponse.json({ error: "FACILITY_NOT_FOUND" }, { status: 404 });

    const updated = await prisma.referral.update({
      where: { id },
      data: {
        status: "REFERRED",
        toFacilityId: facility.id,
        fromFacilityId: parsed.data.fromFacilityId || referral.fromFacilityId || session.facilityId,
      },
    });
    await prisma.referralEvent.create({
      data: {
        referralId: id,
        fromStatus: referral.status,
        toStatus: "REFERRED",
        actorName: session.fullName,
        note: `Referred to ${facility.name} (${facility.careLevel}, ${facility.taluka}). Continuity tracking continues until closure.`,
      },
    });
    await writeAudit({
      userId: session.id,
      action: "REFER",
      entity: "Referral",
      entityId: id,
      detail: facility.name,
    });
    return NextResponse.json({ referral: updated });
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
