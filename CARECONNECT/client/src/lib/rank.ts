import { CARE_LEVEL_RANK, type CareLevel } from "./constants";
import { haversineKm } from "./geo";

export type RankableFacility = {
  id: string;
  name: string;
  careLevel: string;
  taluka: string;
  village: string | null;
  latitude: number;
  longitude: number;
  services: string;
  isPublic: boolean;
  isSynthetic?: boolean;
};

export type RankedFacility = RankableFacility & {
  distanceKm: number;
  score: number;
  reasons: string[];
};

export function rankFacilities(opts: {
  facilities: RankableFacility[];
  origin: { lat: number; lng: number };
  requiredService: string;
  recommendedLevel: CareLevel;
  limit?: number;
}): RankedFacility[] {
  const needed = CARE_LEVEL_RANK[opts.recommendedLevel] ?? 2;
  return opts.facilities
    .filter((f) => f.isPublic)
    .map((f) => {
      const distanceKm = haversineKm(opts.origin.lat, opts.origin.lng, f.latitude, f.longitude);
      const level = CARE_LEVEL_RANK[f.careLevel] ?? 1;
      const serviceList = f.services.split(",").map((s) => s.trim());
      const hasService = serviceList.includes(opts.requiredService) || serviceList.includes("general");
      const reasons: string[] = [];
      let score = 100;
      score -= Math.min(distanceKm * 2.4, 55);
      reasons.push(`${distanceKm.toFixed(1)} km`);
      if (level < needed) {
        score -= (needed - level) * 18;
        reasons.push("below required care level");
      } else if (level === needed) {
        score += 12;
        reasons.push("matches required care level");
      } else {
        score += 4;
        reasons.push("higher-level public facility");
      }
      if (hasService) {
        score += 16;
        reasons.push("offers required service");
      } else {
        score -= 22;
        reasons.push("service may be unavailable");
      }
      if (opts.requiredService === "emergency" && ["RH", "SDH", "DH"].includes(f.careLevel)) {
        score += 8;
        reasons.push("emergency-capable");
      }
      return { ...f, distanceKm, score: Math.round(score * 10) / 10, reasons };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit ?? 8);
}
