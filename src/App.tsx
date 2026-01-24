import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { PricingCatalogProvider } from './context/PricingCatalogContext';
import { ScenarioComparisonProvider } from './context/ScenarioComparisonContext';
import AppHeader from './components/layout/AppHeader';
import { AppRoutes } from './routes/AppRoutes';
import VersionBadge from './components/layout/VersionBadge';
import { 
  generateAutoTrip, 
  validateAutoTrip, 
  estimateTripCost,
  type AutoTripRequest 
} from './services/AutoItineraryBuilder';
import './App.css';

export const App: React.FC = () => {
  // Expose AutoItineraryBuilder to browser console for testing
  useEffect(() => {
    (window as any).AUTO_AGENT = {
      generate: generateAutoTrip,
      validate: validateAutoTrip,
      estimateCost: estimateTripCost,
      // Helper: Example request for quick testing
      exampleRequest: {
        travelers: { adults: 2, children: [8, 12] },
        durationDays: 5,
        budgetTier: 'Luxury',
        focus: 'Gorillas'
      } as AutoTripRequest,
      // Helper: Quick test function
      test: () => {
        const request: AutoTripRequest = {
          travelers: { adults: 2, children: [8, 12] },
          durationDays: 5,
          budgetTier: 'Luxury',
          focus: 'Gorillas'
        };
        const trip = generateAutoTrip(request);
        const warnings = validateAutoTrip(trip);
        const cost = estimateTripCost(trip);
        
        console.log('=== AUTO ITINERARY BUILDER TEST ===');
        console.log('Request:', request);
        console.log('\nGenerated Trip:', trip);
        console.log('\nValidation Warnings:', warnings);
        console.log('\nCost Estimate:', cost);
        console.log('\n=== Full JSON ===');
        console.log(JSON.stringify(trip, null, 2));
        
        return { trip, warnings, cost };
      }
    };
    
    console.log('🤖 AUTO_AGENT exposed to window!');
    console.log('Usage:');
    console.log('  window.AUTO_AGENT.test() - Run quick test');
    console.log('  window.AUTO_AGENT.generate(request) - Generate trip');
    console.log('  window.AUTO_AGENT.validate(trip) - Validate trip');
    console.log('  window.AUTO_AGENT.estimateCost(trip) - Estimate cost');
    console.log('  window.AUTO_AGENT.exampleRequest - See example request format');
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <PricingCatalogProvider>
            <ScenarioComparisonProvider>
              <AppHeader />
              <AppRoutes />
              <VersionBadge />
            </ScenarioComparisonProvider>
          </PricingCatalogProvider>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

