import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LOCALES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const locale = LOCALES.includes(body.locale) ? body.locale : "en";
    await prisma.user.update({ where: { id: session.id }, data: { locale } });
    return NextResponse.json({ locale });
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 400 });
  }
}
