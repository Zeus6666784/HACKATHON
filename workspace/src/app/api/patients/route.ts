import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validations";
import { makeHealthId } from "@/lib/ids";
import { writeAudit } from "@/lib/audit";
import { ROLES } from "@/lib/constants";

export async function GET() {
  try {
    const session = await requireSession();
    const where =
      session.role === ROLES.PATIENT
        ? { accountUserId: session.id }
        : {};
    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { referrals: true } } },
    });
    return NextResponse.json({ patients });
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
    const parsed = patientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION", details: parsed.error.flatten() }, { status: 400 });
    }
    const patient = await prisma.patient.create({
      data: {
        healthId: makeHealthId(),
        fullName: parsed.data.fullName,
        age: parsed.data.age,
        sex: parsed.data.sex,
        phone: parsed.data.phone || null,
        village: parsed.data.village,
        taluka: parsed.data.taluka,
        district: parsed.data.district || "Palghar",
        caregiverName: parsed.data.caregiverName || null,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        registeredById: session.id,
        isSynthetic: true,
      },
    });
    await writeAudit({
      userId: session.id,
      action: "CREATE_PATIENT",
      entity: "Patient",
      entityId: patient.id,
      detail: patient.healthId,
    });
    return NextResponse.json({ patient });
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
