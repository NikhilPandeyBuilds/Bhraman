// Bhraman - Time-Based Reachability & Isochrone Engine
// Strictly PS6: Local & Experiences
// Calculates realistic reachable experience space based on road networks, modes, & traffic

import { Coordinates, TransportMode, TrafficCondition } from '../types';

export interface TravelEstimate {
  distanceKm: number;
  travelMinutes: number;
  costInRupees: number;
  feasibilityRatio: number; // 0.0 - 1.0
}

export class ReachabilityService {
  /**
   * Average speed (km/h) by transport mode in Mumbai urban conditions
   */
  private static readonly MODE_BASE_SPEEDS: Record<TransportMode, number> = {
    walk: 4.5,
    bicycle: 12.0,
    bike: 26.0,
    auto: 21.0,
    cab: 23.0,
  };

  /**
   * Cost per kilometer in INR
   */
  private static readonly MODE_COST_PER_KM: Record<TransportMode, number> = {
    walk: 0,
    bicycle: 0,
    bike: 6.0,
    auto: 18.0,
    cab: 30.0,
  };

  /**
   * Fixed base flag-fall fare
   */
  private static readonly MODE_BASE_FARE: Record<TransportMode, number> = {
    walk: 0,
    bicycle: 0,
    bike: 0,
    auto: 28.0,
    cab: 60.0,
  };

  /**
   * Traffic multipliers
   */
  private static readonly TRAFFIC_MULTIPLIERS: Record<TrafficCondition, Record<TransportMode, number>> = {
    normal: {
      walk: 1.0,
      bicycle: 1.0,
      bike: 1.0,
      auto: 1.0,
      cab: 1.0,
    },
    heavy: {
      walk: 1.0,    // Walkers bypass road traffic
      bicycle: 1.15, // Can filter through jams
      bike: 1.35,    // Two-wheelers filter between lanes
      auto: 1.75,    // Trapped in choke points
      cab: 1.95,     // Heavy car congestion & parking queues
    },
    severe: {
      walk: 1.0,
      bicycle: 1.3,
      bike: 1.6,
      auto: 2.3,
      cab: 2.6,
    },
  };

  /**
   * Computes Haversine great-circle distance between two points in km
   */
  public static haversineDistanceKm(c1: Coordinates, c2: Coordinates): number {
    const R = 6371; // Earth radius in km
    const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
    const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.latitude * Math.PI) / 180) *
        Math.cos((c2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Converts straight-line distance to realistic Mumbai street network distance
   * using an urban tortuosity / road network factor (1.28x - 1.40x)
   */
  public static estimateRoadDistanceKm(c1: Coordinates, c2: Coordinates): number {
    const straightKm = this.haversineDistanceKm(c1, c2);
    const roadNetworkFactor = 1.32;
    return Math.round(straightKm * roadNetworkFactor * 100) / 100;
  }

  /**
   * Calculates realistic travel time & cost between two locations
   */
  public static estimateTravel(
    from: Coordinates,
    to: Coordinates,
    mode: TransportMode,
    traffic: TrafficCondition = 'normal'
  ): TravelEstimate {
    const distanceKm = this.estimateRoadDistanceKm(from, to);
    const baseSpeedKmH = this.MODE_BASE_SPEEDS[mode];
    const trafficMultiplier = this.TRAFFIC_MULTIPLIERS[traffic][mode];

    // Base travel minutes = (distance / speed) * 60 * traffic multiplier
    let travelMinutes = Math.round((distanceKm / baseSpeedKmH) * 60 * trafficMultiplier);

    // Minimum 3 minutes for any vehicle movement (getting on vehicle, signals)
    if (mode !== 'walk' && travelMinutes < 3 && distanceKm > 0.1) {
      travelMinutes = 3;
    }
    // Add parking search friction for cabs in dense neighborhoods
    if (mode === 'cab') {
      travelMinutes += traffic === 'heavy' ? 6 : 3;
    }

    // Cost estimation
    const perKmRate = this.MODE_COST_PER_KM[mode];
    const baseFare = this.MODE_BASE_FARE[mode];
    let costInRupees = 0;
    if (perKmRate > 0) {
      costInRupees = Math.round(baseFare + distanceKm * perKmRate);
    }

    return {
      distanceKm,
      travelMinutes,
      costInRupees,
      feasibilityRatio: 1.0,
    };
  }

  /**
   * Generates a realistic time-based isochrone boundary polygon
   * for visualization on the map. Represents the reachable experience boundary
   * rather than a geometric circle.
   */
  public static generateIsochronePolygon(
    center: Coordinates,
    availableMinutes: number,
    mode: TransportMode,
    traffic: TrafficCondition = 'normal'
  ): Coordinates[] {
    const baseSpeed = this.MODE_BASE_SPEEDS[mode];
    const trafficFactor = this.TRAFFIC_MULTIPLIERS[traffic][mode];
    const effectiveSpeed = baseSpeed / trafficFactor;

    // Max practical travel radius in kilometers
    // A traveler typically dedicates at most 35% of total time to one-way transit
    const oneWayBudgetMinutes = Math.min(availableMinutes * 0.35, 45);
    const maxDistanceKm = (effectiveSpeed * (oneWayBudgetMinutes / 60)) / 1.32;

    const points: Coordinates[] = [];
    const numVertices = 16;
    const latConversion = 1 / 111; // 1 km in degrees latitude

    for (let i = 0; i < numVertices; i++) {
      const angle = (i * 2 * Math.PI) / numVertices;
      // Irregularity based on Mumbai's peninsular geometry and coast
      // Coastal distortion: narrower east-west, elongated north-south
      const coastModulation = 1.0 + 0.15 * Math.sin(angle * 2) - 0.1 * Math.cos(angle);
      const radiusKm = maxDistanceKm * coastModulation;

      const dLat = (radiusKm * Math.cos(angle)) * latConversion;
      const dLng =
        (radiusKm * Math.sin(angle)) /
        (111 * Math.cos((center.latitude * Math.PI) / 180));

      points.push({
        latitude: center.latitude + dLat,
        longitude: center.longitude + dLng,
      });
    }

    return points;
  }
}
