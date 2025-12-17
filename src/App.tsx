import React from 'react';
import { TripProvider } from './context/TripContext';
import { PricingCatalogProvider } from './context/PricingCatalogContext';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

export const App: React.FC = () => {
  return (
    <TripProvider>
      <PricingCatalogProvider>
        <AppRoutes />
      </PricingCatalogProvider>
    </TripProvider>
  );
};

