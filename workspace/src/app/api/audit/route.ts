import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/constants";

export async function GET() {
  try {
    const session = await requireSession();
    if (session.role !== ROLES.ADMIN && session.role !== ROLES.FACILITY_STAFF) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    const logs = await prisma.auditLog.findMany({
      take: 80,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { fullName: true, role: true } } },
    });
    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
}
