/**
 * Expose AutoItineraryBuilder to window for console testing
 * This file runs ONCE on import, outside of React lifecycle
 */

import { 
  generateAutoTrip, 
  validateAutoTrip, 
  estimateTripCost 
} from './services/AutoItineraryBuilder';

// Expose to window immediately on module load
(window as any).AUTO_AGENT = {
  generate: generateAutoTrip,
  validate: validateAutoTrip,
  estimateCost: estimateTripCost,
  exampleRequest: {
    travelers: { adults: 2, children: [8, 12] },
    durationDays: 5,
    budgetTier: 'Luxury' as const,
    focus: 'Gorillas' as const
  },
  test: function() {
    const request = {
      travelers: { adults: 2, children: [8, 12] },
      durationDays: 5,
      budgetTier: 'Luxury' as const,
      focus: 'Gorillas' as const
    };
    const trip = generateAutoTrip(request);
    const warnings = validateAutoTrip(trip);
    const cost = estimateTripCost(trip);
    
    console.log('=== AUTO ITINERARY BUILDER TEST ===');
    console.log('Request:', request);
    console.log('Generated Trip:', trip);
    console.log('Validation Warnings:', warnings);
    console.log('Cost Estimate:', cost);
    console.log('=== Full JSON ===');
    console.log(JSON.stringify(trip, null, 2));
    
    return { trip, warnings, cost };
  }
};
