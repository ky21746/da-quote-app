import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TripBuilderPage } from '../pages/TripBuilderPage';
import { TripSummaryPage } from '../pages/TripSummaryPage';
import { TripDaysEditorPage } from '../pages/TripDaysEditorPage';
import { ManualPricingPage } from '../pages/ManualPricingPage';
import { LogisticsPage } from '../pages/LogisticsPage';
import { ReviewPage } from '../pages/ReviewPage';
import { PricingPage } from '../pages/PricingPage';
import { PricingCatalogPage } from '../pages/PricingCatalogPage';
import FirestoreProbe from '../debug/FirestoreProbe';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/trip/new" element={<TripBuilderPage />} />
      <Route path="/trip/:id/edit" element={<TripDaysEditorPage />} />
      <Route path="/trip/:id/logistics" element={<LogisticsPage />} />
      <Route path="/trip/:id/review" element={<ReviewPage />} />
      <Route path="/trip/:id/pricing" element={<PricingPage />} />
      <Route path="/trip/:id/pricing/manual" element={<ManualPricingPage />} />
      <Route path="/trip/:id/summary" element={<TripSummaryPage />} />
      <Route path="/admin/pricing-catalog" element={<PricingCatalogPage />} />
      <Route path="/debug/firestore" element={<FirestoreProbe />} />
      <Route path="/" element={<Navigate to="/trip/new" replace />} />
    </Routes>
  );
};

