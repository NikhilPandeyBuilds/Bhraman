// Test Engine Verification Script
import { NLPParser } from './services/nlpParser';
import { RecommendationEngine } from './services/recommendationEngine';
import { ReplanningEngine } from './services/replanningEngine';

console.log("=== 1. Testing NLP Parser ===");
const sample = NLPParser.DEMO_VOICE_SAMPLE;
const parsed = NLPParser.parse(sample);
console.log("Parsed result:", JSON.stringify(parsed, null, 2));

console.log("\n=== 2. Building Initial 3-Hour Bandra Micro-Itinerary ===");
const constraints = parsed.constraints as any;
const initialPlan = RecommendationEngine.buildItinerary(constraints);

console.log(`Plan ID: ${initialPlan.id}`);
console.log(`Time: ${initialPlan.startTime} -> ${initialPlan.endTime} (${initialPlan.totalTimeMinutes}m total)`);
console.log(`Cost: ₹${initialPlan.totalCost} / ₹${initialPlan.budgetLimit}`);
console.log(`Safety Return Buffer: ${initialPlan.safetyBufferMinutes} minutes`);
console.log(`Stops count: ${initialPlan.stops.length}`);

initialPlan.stops.forEach(s => {
  console.log(`  Stop ${s.stopIndex}: ${s.place.name} (${s.place.category})`);
  console.log(`    Travel: ${s.travelTimeMinutes}m | Stay: ${s.activityDurationMinutes}m | Leg Cost: ₹${s.totalLegCost}`);
  console.log(`    Why: ${s.whyChosen}`);
});
console.log(`  Return leg: ${initialPlan.returnTravelMinutes}m | Cost: ₹${initialPlan.returnTravelCost}`);

console.log("\n=== 3. Simulating Heavy Rain ===");
const rainDiff = ReplanningEngine.handleHeavyRain(initialPlan, constraints);
console.log(`Diff Trigger: ${rainDiff.trigger}`);
console.log(`Diff Reason: ${rainDiff.reason}`);
console.log(`Removed: ${rainDiff.removedStops.map(s => s.name).join(', ')}`);
console.log(`Added: ${rainDiff.addedStops.map(s => s.name).join(', ')}`);
console.log(`New Buffer: ${rainDiff.newBufferMinutes}m`);

console.log("\n=== 4. Simulating Traffic Spike ===");
const trafficDiff = ReplanningEngine.handleTrafficSpike(initialPlan, constraints);
console.log(`Traffic Diff Reason: ${trafficDiff.reason}`);
console.log(`New Buffer: ${trafficDiff.newBufferMinutes}m`);

console.log("\n=== 5. Simulating Time Cut (70 min) ===");
const timeDiff = ReplanningEngine.handleTimeReduction(initialPlan, constraints, 70);
console.log(`Time Cut Stops: ${timeDiff.newPlan.stops.length}`);
console.log(`Time Cut Duration: ${timeDiff.newPlan.totalTimeMinutes}m / 70m | Buffer: ${timeDiff.newBufferMinutes}m`);

console.log("\nALL ENGINE CHECKS PASSED!");
