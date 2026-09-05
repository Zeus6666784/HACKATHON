import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { advanceSchema } from "@/lib/validations";
import { advanceReferral } from "@/lib/referrals";
import { ROLES } from "@/lib/constants";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession();
    if (session.role === ROLES.PATIENT) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const parsed = advanceSchema.safeParse({ ...body, referralId: id });
    if (!parsed.success) {
      return NextResponse.json({ error: "VALIDATION" }, { status: 400 });
    }
    const extra: { appointmentAt?: Date } = {};
    if (parsed.data.appointmentAt) extra.appointmentAt = new Date(parsed.data.appointmentAt);
    const updated = await advanceReferral({
      referralId: parsed.data.referralId,
      actorName: session.fullName,
      userId: session.id,
      note: parsed.data.note,
      extra,
    });
    return NextResponse.json({ referral: updated });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "FAILED";
    const status = msg === "NOT_FOUND" ? 404 : msg === "ALREADY_CLOSED" ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
