import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { dashboardStats } from "@/lib/referrals";
import { prisma } from "@/lib/prisma";
import { isOverdue } from "@/lib/referrals";

export async function GET() {
  try {
    await requireSession();
    const stats = await dashboardStats();
    const recent = await prisma.referral.findMany({
      take: 12,
      orderBy: { updatedAt: "desc" },
      include: {
        patient: true,
        toFacility: true,
        fromFacility: true,
      },
    });
    const byStatus = await prisma.referral.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    return NextResponse.json({
      stats,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
      recent: recent.map((r) => ({
        id: r.id,
        publicId: r.publicId,
        status: r.status,
        priority: r.priority,
        requiredService: r.requiredService,
        patientName: r.patient.fullName,
        village: r.patient.village,
        taluka: r.patient.taluka,
        toFacility: r.toFacility?.name ?? null,
        fromFacility: r.fromFacility?.name ?? null,
        overdue: isOverdue(r.updatedAt, r.status, r.dueAt),
        isSynthetic: r.isSynthetic,
        updatedAt: r.updatedAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
}
