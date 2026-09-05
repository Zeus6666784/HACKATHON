import { NextResponse } from "next/server";
import { clearSession, getSession } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

export async function POST() {
  const session = await getSession();
  await clearSession();
  if (session) {
    await writeAudit({
      userId: session.id,
      action: "LOGOUT",
      entity: "User",
      entityId: session.id,
    });
  }
  return NextResponse.json({ ok: true });
}
