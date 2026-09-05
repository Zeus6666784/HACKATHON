import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankFacilities } from "@/lib/rank";
import type { CareLevel } from "@/lib/constants";
import { PALGHAR_CENTER } from "@/lib/geo";

export async function GET(req: Request) {
  try {
    await requireSession();
    const url = new URL(req.url);
    const lat = Number(url.searchParams.get("lat") ?? PALGHAR_CENTER.lat);
    const lng = Number(url.searchParams.get("lng") ?? PALGHAR_CENTER.lng);
    const service = url.searchParams.get("service") ?? "general";
    const level = (url.searchParams.get("level") ?? "PHC") as CareLevel;
    const q = url.searchParams.get("q")?.trim();

    const facilities = await prisma.facility.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { taluka: { contains: q } },
              { village: { contains: q } },
            ],
          }
        : undefined,
    });
    const ranked = rankFacilities({
      facilities,
      origin: { lat, lng },
      requiredService: service,
      recommendedLevel: ["SC", "PHC", "RH", "SDH", "DH"].includes(level) ? level : "PHC",
    });
    return NextResponse.json({ facilities: ranked, origin: { lat, lng } });
  } catch {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }
}
