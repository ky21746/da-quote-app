import React from 'react';
import { TripProvider } from './context/TripContext';
import { AppRoutes } from './routes/AppRoutes';
import './App.css';

export const App: React.FC = () => {
  return (
    <TripProvider>
      <AppRoutes />
    </TripProvider>
  );
};

