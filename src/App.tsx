import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { PricingCatalogProvider } from './context/PricingCatalogContext';
import { ScenarioComparisonProvider } from './context/ScenarioComparisonContext';
import { LanguageProvider } from './context/LanguageContext';
import AppHeader from './components/layout/AppHeader';
import { AppRoutes } from './routes/AppRoutes';
import VersionBadge from './components/layout/VersionBadge';
import './App.css';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <TripProvider>
            <PricingCatalogProvider>
              <ScenarioComparisonProvider>
                <AppHeader />
                <AppRoutes />
                <VersionBadge />
              </ScenarioComparisonProvider>
            </PricingCatalogProvider>
          </TripProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

