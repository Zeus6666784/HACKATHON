import { Facility, FacilityBreakdown } from "../models/Facility";

export interface RankingRequest {
  symptoms: string;
  isEmergency: boolean;
  userLocation?: [number, number];
}

export interface RankedFacility {
  facility: Facility;
  score: number;
  distanceKm?: number;
  breakdown: FacilityBreakdown;
}

export class FacilityRankingService {
  private static DISTANCE_WEIGHT = 0.30;
  private static CARE_LEVEL_WEIGHT = 0.25;
  private static CAPABILITY_WEIGHT = 0.20;
  private static APPROPRIATENESS_WEIGHT = 0.15;
  private static CONFIDENCE_WEIGHT = 0.10;

  private static haversineDistance(coords1: [number, number], coords2: [number, number]): number {
    const [lat1, lon1] = coords1;
    const [lat2, lon2] = coords2;
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  public static async rankFacilities(req: RankingRequest): Promise<RankedFacility[]> {
    const facilities = await Facility.find();
    const symptoms = req.symptoms.toLowerCase();

    const results = facilities.map(facility => {
      // 1. Distance Score (0-100)
      let distanceScore = 0;
      let distanceKm = 0;
      if (req.userLocation && facility.coordinates) {
        distanceKm = this.haversineDistance(req.userLocation, facility.coordinates);
        distanceScore = Math.max(0, 100 - (distanceKm / 2)); // 100 at 0km, 0 at 200km
      }

      // 2. Care Level Score (0-100)
      // PHC=10, District=15, Tertiary=20 in old code. Let's use 0-100.
      const careLevelMap: Record<string, number> = { "PHC": 40, "DISTRICT": 70, "TERTIARY": 100 };
      const careLevelScore = careLevelMap[facility.type] || 0;

      // 3. Capability Score (0-100)
      const capabilityMatch = facility.services.some(s => symptoms.includes(s.toLowerCase())) ? 100 : 0;

      // 4. Appropriateness (0-100)
      let appropriatenessScore = 0;
      if (req.isEmergency) {
        appropriatenessScore = facility.emergencyCapability ? 100 : 0;
      } else {
        appropriatenessScore = 70; // Baseline for normal referrals
      }

      // 5. Confidence / Verification (0-100)
      const confidenceMap: Record<string, number> = { "VERIFIED": 100, "UNVERIFIED": 50, "UNKNOWN": 20, "SYNTHETIC": 10 };
      const confidenceScore = confidenceMap[facility.verificationState] || 0;

      // Final Weighted Score
      const finalScore = (
        (distanceScore * this.DISTANCE_WEIGHT) +
        (careLevelScore * this.CARE_LEVEL_WEIGHT) +
        (capabilityMatch * this.CAPABILITY_WEIGHT) +
        (appropriatenessScore * this.APPROPRIATENESS_WEIGHT) +
        (confidenceScore * this.CONFIDENCE_WEIGHT)
      );

      // Explanation Generation
      const explanations: string[] = [];
      if (capabilityMatch === 100) explanations.push("matches required specialist services");
      if (careLevelScore >= 70) explanations.push("appropriate higher-level care capability");
      if (distanceKm > 0 && distanceKm < 20) explanations.push("is among the closest available options");
      if (facility.verificationState === "VERIFIED") explanations.push("is a government-verified facility");

      const explanation = explanations.length > 0
        ? `Recommended because this facility ${explanations.join(", ")}.`
        : "Recommended based on general proximity and availability.";

      return {
        facility,
        score: Math.round(finalScore),
        distanceKm: distanceKm > 0 ? Math.round(distanceKm * 100) / 100 : undefined,
        breakdown: {
          distanceScore,
          careLevelScore,
          capabilityScore: capabilityMatch,
          verificationMultiplier: confidenceScore / 100,
          explanation
        }
      };
    });

    return results.sort((a, b) => b.score - a.score);
  }
}
