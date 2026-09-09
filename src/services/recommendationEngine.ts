// Bhraman - Constraint & Recommendation Engine
// Strictly PS6: Local & Experiences
// Evaluates Hard & Soft constraints and mathematically builds personalized micro-itineraries

import { 
  Place, 
  TravelerConstraints, 
  MicroItinerary, 
  ItineraryStop, 
  ScoreBreakdown, 
  TrafficCondition, 
  WeatherCondition 
} from '../types';
import { ReachabilityService } from './reachabilityService';
import { MUMBAI_PLACES } from '../data/mumbaiPlaces';

export class RecommendationEngine {
  /**
   * Evaluates hard constraints on a candidate place
   * Returns false if candidate violates hard constraints
   */
  public static satisfiesHardConstraints(
    place: Place,
    constraints: TravelerConstraints,
    weather: WeatherCondition
  ): { feasible: boolean; reason?: string } {
    // 1. Is open
    if (!place.isOpen) {
      return { feasible: false, reason: "Place is currently closed" };
    }

    // 2. Weather constraint: Outdoor places during heavy rain are pruned
    if (weather === 'rain' && !place.isIndoor) {
      return { feasible: false, reason: "Outdoor location incompatible with heavy rain" };
    }

    // 3. Budget constraint (per person cost * group size cannot exceed total budget)
    const totalPlaceCost = place.averageCostPerPerson * constraints.groupSize;
    if (totalPlaceCost > constraints.budget * 0.75) {
      return { feasible: false, reason: "Cost exceeds practical single-stop budget threshold" };
    }

    return { feasible: true };
  }

  /**
   * Transparent 8-Factor Soft Scoring Model
   */
  public static calculateSoftScore(
    place: Place,
    currentCoord: { latitude: number; longitude: number },
    constraints: TravelerConstraints,
    traffic: TrafficCondition
  ): ScoreBreakdown {
    // 1. Preference Match (30%)
    let matchCount = 0;
    for (const interest of constraints.interests) {
      if (place.category === interest || place.tags.some(t => t.toLowerCase().includes(interest))) {
        matchCount++;
      }
    }
    const preferenceMatch = Math.min(1.0, matchCount / Math.max(1, constraints.interests.length)) * 30;

    // 2. Feasibility & Distance (20%)
    const travel = ReachabilityService.estimateTravel(
      currentCoord,
      place.coordinates,
      constraints.transportMode,
      traffic
    );
    // Ideal one-way travel is under 20 minutes
    const travelScore = Math.max(0, 1.0 - travel.travelMinutes / 45);
    const feasibility = travelScore * 20;

    // 3. Travel Efficiency (15%)
    // Less road distance means higher efficiency
    const travelEfficiency = Math.max(0, 1.0 - travel.distanceKm / 12) * 15;

    // 4. Community Trust (10%)
    let trustScore = place.provenance === 'community' ? 0.95 : place.provenance === 'verified' ? 1.0 : 0.85;
    if (place.provenance === 'sponsored') trustScore = 0.75;
    const communityTrust = trustScore * 10;

    // 5. Freshness & Authenticity (10%)
    const freshness = (place.authenticityScore / 100) * 10;

    // 6. Rating Quality (5%)
    const ratingQuality = (place.rating / 5.0) * 5;

    // 7. Uniqueness (5%)
    const uniqueness = (place.uniquenessScore / 100) * 5;

    // 8. Budget Fit (5%)
    const estCost = place.averageCostPerPerson * constraints.groupSize;
    const budgetRatio = estCost / Math.max(1, constraints.budget);
    const budgetFit = Math.max(0, 1.0 - budgetRatio * 0.8) * 5;

    const totalScore = Math.round(
      (preferenceMatch +
        feasibility +
        travelEfficiency +
        communityTrust +
        freshness +
        ratingQuality +
        uniqueness +
        budgetFit) *
        10
    ) / 10;

    return {
      preferenceMatch: Math.round(preferenceMatch * 10) / 10,
      feasibility: Math.round(feasibility * 10) / 10,
      travelEfficiency: Math.round(travelEfficiency * 10) / 10,
      communityTrust: Math.round(communityTrust * 10) / 10,
      freshness: Math.round(freshness * 10) / 10,
      ratingQuality: Math.round(ratingQuality * 10) / 10,
      uniqueness: Math.round(uniqueness * 10) / 10,
      budgetFit: Math.round(budgetFit * 10) / 10,
      totalScore,
    };
  }

  /**
   * Generates a realistic, transparent reason for why Bhraman selected this stop
   */
  private static generateWhyChosenReason(
    place: Place,
    travelMinutes: number,
    constraints: TravelerConstraints,
    score: ScoreBreakdown
  ): string {
    const matchedCategories = constraints.interests.filter(i => 
      place.category === i || place.tags.some(t => t.toLowerCase().includes(i))
    );
    const matchLabel = matchedCategories.length > 0 ? matchedCategories.join(' & ') : place.category;
    
    return `Matches your ${matchLabel} preferences, reaches in ${travelMinutes} min via ${constraints.transportMode}, stays well within ₹${constraints.budget} budget, and preserves guaranteed return buffer.`;
  }

  /**
   * Converts a LocalDiscovery entity into a candidate Place for recommendation
   */
  public static convertDiscoveryToPlace(disc: any): Place {
    return {
      id: disc.id,
      name: disc.title,
      category: disc.category,
      tags: [disc.category, 'community gem', disc.neighborhood || 'Local Area'],
      description: disc.description + (disc.localTip ? ` [Local Tip: ${disc.localTip}]` : ''),
      neighborhood: disc.neighborhood || 'Bandra West',
      coordinates: disc.coordinates,
      averageCostPerPerson: disc.averageCostPerPerson || 0,
      typicalStayMinutes: disc.typicalStayMinutes || 30,
      openingHours: 'Open daylight hours',
      isOpen: true,
      isIndoor: disc.category === 'food' || disc.category === 'culture',
      provenance: disc.isUserCreated ? 'user_contributed' : 'community',
      verificationNote: `Discovered by ${disc.creatorName} (${disc.verifiedDaysAgo || 2}d ago)`,
      rating: 4.8,
      reviewCount: (disc.likesCount || 10) + (disc.commentsCount || 2),
      authenticityScore: 97,
      uniquenessScore: 96,
      imageUrl: disc.imageUrl,
      isDemoData: disc.isDemoData,
      isUserCreated: disc.isUserCreated,
    };
  }

  /**
   * Builds a complete, calculated micro-itinerary
   * Strictly enforces return-to-base and safety buffer
   */
  public static buildItinerary(
    constraints: TravelerConstraints,
    allPlaces: Place[] = MUMBAI_PLACES,
    traffic: TrafficCondition = 'normal',
    weather: WeatherCondition = 'clear',
    baseStartTime: string = "08:00 PM",
    extraDiscoveries: any[] = []
  ): MicroItinerary {
    // 1. Convert any community discoveries to places and combine with candidate pool
    const discoveryPlaces = extraDiscoveries.map(d => this.convertDiscoveryToPlace(d));
    const combinedPlaces = [...allPlaces, ...discoveryPlaces];

    // 2. Filter out sponsored items from organic candidate pool
    // Core rule: "Businesses can buy visibility; they cannot buy relevance."
    const organicPool = combinedPlaces.filter(p => p.provenance !== 'sponsored');

    // 2. Filter by hard constraints
    const feasibleCandidates = organicPool.filter(p => {
      const check = this.satisfiesHardConstraints(p, constraints, weather);
      return check.feasible;
    });

    // 3. Determine target number of stops based on available time
    // <= 80 mins -> 1 stop
    // 81 - 140 mins -> 2 stops
    // > 140 mins -> 3 stops
    let targetStops = 3;
    if (constraints.availableMinutes <= 80) {
      targetStops = 1;
    } else if (constraints.availableMinutes <= 140) {
      targetStops = 2;
    }

    // 4. Sequential greedy path selection with diverse category sampling
    const selectedStops: ItineraryStop[] = [];
    let currentCoords = constraints.baseLocation.coordinates;
    let accumulatedMinutes = 0;
    let accumulatedCost = 0;
    const usedCategories = new Set<string>();
    const usedPlaceIds = new Set<string>();

    const startHour = 20; // 08:00 PM
    const startMinute = 0;
    let currentMinuteOffset = 0;

    for (let i = 0; i < targetStops; i++) {
      // Score available candidates from current location
      const scoredCandidates = feasibleCandidates
        .filter(p => !usedPlaceIds.has(p.id))
        .map(p => {
          const score = this.calculateSoftScore(p, currentCoords, constraints, traffic);
          // Boost diversity: slight bonus for not repeating category
          const diversityMultiplier = usedCategories.has(p.category) ? 0.8 : 1.1;
          return {
            place: p,
            score,
            adjustedTotal: score.totalScore * diversityMultiplier,
          };
        })
        .sort((a, b) => b.adjustedTotal - a.adjustedTotal);

      // Find first candidate that satisfies time & return constraints
      let picked: { place: Place; score: ScoreBreakdown } | null = null;
      let pickedTravel = { travelMinutes: 0, distanceKm: 0, costInRupees: 0 };
      let pickedReturn = { travelMinutes: 0, distanceKm: 0, costInRupees: 0 };

      for (const candidate of scoredCandidates) {
        const toPlaceTravel = ReachabilityService.estimateTravel(
          currentCoords,
          candidate.place.coordinates,
          constraints.transportMode,
          traffic
        );

        const returnToBaseTravel = ReachabilityService.estimateTravel(
          candidate.place.coordinates,
          constraints.baseLocation.coordinates,
          constraints.transportMode,
          traffic
        );

        const candidateActivityCost = candidate.place.averageCostPerPerson * constraints.groupSize;
        const candidateTotalLegCost = candidateActivityCost + toPlaceTravel.costInRupees;

        const potentialTotalTime =
          accumulatedMinutes +
          toPlaceTravel.travelMinutes +
          candidate.place.typicalStayMinutes +
          returnToBaseTravel.travelMinutes;

        const potentialTotalCost =
          accumulatedCost + candidateTotalLegCost + returnToBaseTravel.costInRupees;

        // Hard check: must fit into available minutes with buffer, and within budget
        if (
          potentialTotalTime <= constraints.availableMinutes - constraints.minimumBufferMinutes &&
          potentialTotalCost <= constraints.budget
        ) {
          picked = candidate;
          pickedTravel = toPlaceTravel;
          pickedReturn = returnToBaseTravel;
          break;
        }
      }

      if (!picked) {
        // No further stop can fit safely without violating the return deadline
        break;
      }

      // Add to selected stops
      const arrivalOffset = currentMinuteOffset + pickedTravel.travelMinutes;
      const departureOffset = arrivalOffset + picked.place.typicalStayMinutes;

      const arrivalTimeStr = this.formatTime(startHour, startMinute + arrivalOffset);
      const departureTimeStr = this.formatTime(startHour, startMinute + departureOffset);

      const activityCost = picked.place.averageCostPerPerson * constraints.groupSize;
      const totalLegCost = activityCost + pickedTravel.costInRupees;

      selectedStops.push({
        stopIndex: i + 1,
        place: picked.place,
        arrivalTime: arrivalTimeStr,
        departureTime: departureTimeStr,
        travelTimeMinutes: pickedTravel.travelMinutes,
        travelDistanceKm: pickedTravel.distanceKm,
        travelCost: pickedTravel.costInRupees,
        activityDurationMinutes: picked.place.typicalStayMinutes,
        activityCost,
        totalLegCost,
        whyChosen: this.generateWhyChosenReason(
          picked.place,
          pickedTravel.travelMinutes,
          constraints,
          picked.score
        ),
        scoreBreakdown: picked.score,
      });

      usedPlaceIds.add(picked.place.id);
      usedCategories.add(picked.place.category);
      currentCoords = picked.place.coordinates;
      currentMinuteOffset = departureOffset;
      accumulatedMinutes += pickedTravel.travelMinutes + picked.place.typicalStayMinutes;
      accumulatedCost += totalLegCost;
    }

    // 5. Final return leg calculation from last stop to base
    const finalReturnTravel = ReachabilityService.estimateTravel(
      currentCoords,
      constraints.baseLocation.coordinates,
      constraints.transportMode,
      traffic
    );

    const finalTotalTimeMinutes = accumulatedMinutes + finalReturnTravel.travelMinutes;
    const finalTotalCost = accumulatedCost + finalReturnTravel.costInRupees;
    const safetyBufferMinutes = Math.max(0, constraints.availableMinutes - finalTotalTimeMinutes);

    const endHourMinutes = startMinute + finalTotalTimeMinutes;
    const endTimeStr = this.formatTime(startHour, endHourMinutes);

    const confidence: 'High' | 'Moderate' = 
      traffic === 'severe' || safetyBufferMinutes < 10 ? 'Moderate' : 'High';
    const confidenceReason = confidence === 'High' 
      ? 'All stops open, traffic manageable, return buffer guaranteed'
      : 'Moderate buffer; traffic fluctuations monitored closely';

    return {
      id: `itinerary_${Date.now()}`,
      createdAt: new Date().toISOString(),
      baseLocation: constraints.baseLocation,
      startTime: baseStartTime,
      endTime: endTimeStr,
      totalTimeMinutes: finalTotalTimeMinutes,
      totalCost: finalTotalCost,
      budgetLimit: constraints.budget,
      safetyBufferMinutes,
      stops: selectedStops,
      returnTravelMinutes: finalReturnTravel.travelMinutes,
      returnTravelCost: finalReturnTravel.costInRupees,
      confidence,
      confidenceReason,
      trafficCondition: traffic,
      weatherCondition: weather,
      groupSize: constraints.groupSize,
      transportMode: constraints.transportMode,
    };
  }

  private static formatTime(baseHour: number, totalMinutes: number): string {
    const hours = (baseHour + Math.floor(totalMinutes / 60)) % 24;
    const mins = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const displayMins = mins < 10 ? `0${mins}` : `${mins}`;
    return `${displayHour}:${displayMins} ${ampm}`;
  }
}
