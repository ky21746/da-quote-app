import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { PricingCatalogProvider } from './context/PricingCatalogContext';
import AppHeader from './components/layout/AppHeader';
import { AppRoutes } from './routes/AppRoutes';
import VersionBadge from './components/layout/VersionBadge';
import './App.css';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <PricingCatalogProvider>
            <AppHeader />
            <AppRoutes />
            <VersionBadge />
          </PricingCatalogProvider>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

