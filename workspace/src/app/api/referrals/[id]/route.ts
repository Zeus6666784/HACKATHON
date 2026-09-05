import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isOverdue } from "@/lib/referrals";
import { ROLES } from "@/lib/constants";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    const { id } = await ctx.params;
    const referral = await prisma.referral.findFirst({
      where: { OR: [{ id }, { publicId: id }] },
      include: {
        patient: true,
        toFacility: true,
        fromFacility: true,
        createdBy: { select: { fullName: true, role: true } },
        events: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!referral) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (session.role === ROLES.PATIENT && referral.patient.accountUserId !== session.id) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    return NextResponse.json({
      referral: {
        ...referral,
        overdue: isOverdue(referral.updatedAt, referral.status, referral.dueAt),
      },
    });
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
}
