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
  // Expose AutoItineraryBuilder to browser console for testing - ONCE ONLY
  React.useEffect(() => {
    if (!(window as any).AUTO_AGENT) {
      (window as any).AUTO_AGENT = {
        generate: generateAutoTrip,
        validate: validateAutoTrip,
        estimateCost: estimateTripCost,
        exampleRequest: {
          travelers: { adults: 2, children: [8, 12] },
          durationDays: 5,
          budgetTier: 'Luxury',
          focus: 'Gorillas'
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
    }
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

