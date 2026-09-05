import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

export async function GET(req: Request) {
  try {
    await requireSession();
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    if (!q || q.length < 3) {
      return NextResponse.json({ error: "QUERY_TOO_SHORT" }, { status: 400 });
    }
    const params = new URLSearchParams({
      format: "jsonv2",
      q: `${q} Palghar Maharashtra India`,
      limit: "8",
      countrycodes: "in",
      viewbox: "72.6,20.2,73.6,19.5",
      bounded: "1",
    });
    const res = await fetch(`${NOMINATIM}?${params.toString()}`, {
      headers: {
        "User-Agent": "CareConnect-Maharashtra/1.0 (rural-referral-demo)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ results: [], source: "fallback" });
    }
    const data = (await res.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
      osm_id: number;
      osm_type: string;
      type: string;
      class: string;
    }>;
    return NextResponse.json({
      results: data.map((d) => ({
        name: d.display_name,
        lat: Number(d.lat),
        lng: Number(d.lon),
        osmId: `${d.osm_type}:${d.osm_id}`,
        kind: d.type,
        cls: d.class,
      })),
      source: "nominatim",
    });
  } catch {
    return NextResponse.json({ error: "FAILED" }, { status: 500 });
  }
}
