// Bhraman - Dynamic Context-Aware Replanning Engine
// Strictly PS6: Local & Experiences
// Adapts itineraries when local reality changes (Rain, Traffic Spikes, Time Cuts, Budget Cuts)

import { 
  MicroItinerary, 
  TravelerConstraints, 
  ReplanningDiff, 
  TrafficCondition, 
  WeatherCondition,
  Place 
} from '../types';
import { RecommendationEngine } from './recommendationEngine';
import { MUMBAI_PLACES } from '../data/mumbaiPlaces';

export class ReplanningEngine {
  /**
   * Adapts existing itinerary to Heavy Rain
   */
  public static handleHeavyRain(
    currentItinerary: MicroItinerary,
    constraints: TravelerConstraints
  ): ReplanningDiff {
    const updatedWeather: WeatherCondition = 'rain';

    // Rebuild plan with rain weather constraint active
    const newPlan = RecommendationEngine.buildItinerary(
      constraints,
      MUMBAI_PLACES,
      currentItinerary.trafficCondition,
      updatedWeather,
      currentItinerary.startTime
    );

    const oldPlaceIds = new Set(currentItinerary.stops.map(s => s.place.id));
    const newPlaceIds = new Set(newPlan.stops.map(s => s.place.id));

    const removedStops: Place[] = currentItinerary.stops
      .filter(s => !newPlaceIds.has(s.place.id))
      .map(s => s.place);

    const addedStops: Place[] = newPlan.stops
      .filter(s => !oldPlaceIds.has(s.place.id))
      .map(s => s.place);

    const removedName = removedStops.length > 0 ? removedStops[0].name : "Outdoor spot";
    const addedName = addedStops.length > 0 ? addedStops[0].name : "Covered cultural alternative";

    return {
      trigger: 'heavy_rain',
      reason: `Heavy rain detected. Replaced outdoor location (${removedName}) with weather-protected indoor experience (${addedName}).`,
      removedStops,
      addedStops,
      oldDurationMinutes: currentItinerary.totalTimeMinutes,
      newDurationMinutes: newPlan.totalTimeMinutes,
      oldCost: currentItinerary.totalCost,
      newCost: newPlan.totalCost,
      oldBufferMinutes: currentItinerary.safetyBufferMinutes,
      newBufferMinutes: newPlan.safetyBufferMinutes,
      newPlan,
    };
  }

  /**
   * Adapts existing itinerary to Traffic Spike
   */
  public static handleTrafficSpike(
    currentItinerary: MicroItinerary,
    constraints: TravelerConstraints
  ): ReplanningDiff {
    const updatedTraffic: TrafficCondition = 'heavy';

    // Rebuild plan under heavy traffic
    const newPlan = RecommendationEngine.buildItinerary(
      constraints,
      MUMBAI_PLACES,
      updatedTraffic,
      currentItinerary.weatherCondition,
      currentItinerary.startTime
    );

    const oldPlaceIds = new Set(currentItinerary.stops.map(s => s.place.id));
    const newPlaceIds = new Set(newPlan.stops.map(s => s.place.id));

    const removedStops: Place[] = currentItinerary.stops
      .filter(s => !newPlaceIds.has(s.place.id))
      .map(s => s.place);

    const addedStops: Place[] = newPlan.stops
      .filter(s => !oldPlaceIds.has(s.place.id))
      .map(s => s.place);

    return {
      trigger: 'traffic_spike',
      reason: "Severe traffic spike detected along return corridors. Recalculated travel times to strictly guarantee your hotel return deadline.",
      removedStops,
      addedStops,
      oldDurationMinutes: currentItinerary.totalTimeMinutes,
      newDurationMinutes: newPlan.totalTimeMinutes,
      oldCost: currentItinerary.totalCost,
      newCost: newPlan.totalCost,
      oldBufferMinutes: currentItinerary.safetyBufferMinutes,
      newBufferMinutes: newPlan.safetyBufferMinutes,
      newPlan,
    };
  }

  /**
   * Adapts itinerary when available exploration time is reduced (e.g. 180 min -> 70 min)
   */
  public static handleTimeReduction(
    currentItinerary: MicroItinerary,
    constraints: TravelerConstraints,
    newAvailableMinutes: number = 70
  ): ReplanningDiff {
    const updatedConstraints: TravelerConstraints = {
      ...constraints,
      availableMinutes: newAvailableMinutes,
      minimumBufferMinutes: 10,
    };

    const newPlan = RecommendationEngine.buildItinerary(
      updatedConstraints,
      MUMBAI_PLACES,
      currentItinerary.trafficCondition,
      currentItinerary.weatherCondition,
      currentItinerary.startTime
    );

    const oldPlaceIds = new Set(currentItinerary.stops.map(s => s.place.id));
    const newPlaceIds = new Set(newPlan.stops.map(s => s.place.id));

    const removedStops: Place[] = currentItinerary.stops
      .filter(s => !newPlaceIds.has(s.place.id))
      .map(s => s.place);

    const addedStops: Place[] = newPlan.stops
      .filter(s => !oldPlaceIds.has(s.place.id))
      .map(s => s.place);

    return {
      trigger: 'time_cut',
      reason: `Available time cut to ${newAvailableMinutes} minutes. Shrunk reachable boundary to preserve highest-value nearby discovery and guaranteed return.`,
      removedStops,
      addedStops,
      oldDurationMinutes: currentItinerary.totalTimeMinutes,
      newDurationMinutes: newPlan.totalTimeMinutes,
      oldCost: currentItinerary.totalCost,
      newCost: newPlan.totalCost,
      oldBufferMinutes: currentItinerary.safetyBufferMinutes,
      newBufferMinutes: newPlan.safetyBufferMinutes,
      newPlan,
    };
  }

  /**
   * Adapts itinerary when budget is reduced (e.g. ₹3,000 -> ₹1,000)
   */
  public static handleBudgetReduction(
    currentItinerary: MicroItinerary,
    constraints: TravelerConstraints,
    newBudget: number = 1000
  ): ReplanningDiff {
    const updatedConstraints: TravelerConstraints = {
      ...constraints,
      budget: newBudget,
    };

    const newPlan = RecommendationEngine.buildItinerary(
      updatedConstraints,
      MUMBAI_PLACES,
      currentItinerary.trafficCondition,
      currentItinerary.weatherCondition,
      currentItinerary.startTime
    );

    const oldPlaceIds = new Set(currentItinerary.stops.map(s => s.place.id));
    const newPlaceIds = new Set(newPlan.stops.map(s => s.place.id));

    const removedStops: Place[] = currentItinerary.stops
      .filter(s => !newPlaceIds.has(s.place.id))
      .map(s => s.place);

    const addedStops: Place[] = newPlan.stops
      .filter(s => !oldPlaceIds.has(s.place.id))
      .map(s => s.place);

    return {
      trigger: 'budget_cut',
      reason: `Budget adjusted to ₹${newBudget}. Re-optimized for authentic street snacks and community heritage walk.`,
      removedStops,
      addedStops,
      oldDurationMinutes: currentItinerary.totalTimeMinutes,
      newDurationMinutes: newPlan.totalTimeMinutes,
      oldCost: currentItinerary.totalCost,
      newCost: newPlan.totalCost,
      oldBufferMinutes: currentItinerary.safetyBufferMinutes,
      newBufferMinutes: newPlan.safetyBufferMinutes,
      newPlan,
    };
  }
}
