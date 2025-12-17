import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TripBuilderPage } from '../pages/TripBuilderPage';
import { TripSummaryPage } from '../pages/TripSummaryPage';
import { TripDaysEditorPage } from '../pages/TripDaysEditorPage';
import { ManualPricingPage } from '../pages/ManualPricingPage';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/trip/new" element={<TripBuilderPage />} />
        <Route path="/trip/:id/edit" element={<TripDaysEditorPage />} />
        <Route path="/trip/:id/pricing" element={<ManualPricingPage />} />
        <Route path="/trip/:id/summary" element={<TripSummaryPage />} />
        <Route path="/" element={<Navigate to="/trip/new" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

