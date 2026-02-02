import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../components/Auth/LoginPage';
import { ProtectedRoute } from '../components/Auth/ProtectedRoute';
import { TripBuilderPage } from '../pages/TripBuilderPage';
import { TripSummaryPage } from '../pages/TripSummaryPage';
import { TripDaysEditorPage } from '../pages/TripDaysEditorPage';
import { ManualPricingPage } from '../pages/ManualPricingPage';
import { LogisticsPage } from '../pages/LogisticsPage';
import { ReviewPage } from '../pages/ReviewPage';
import { PricingPage } from '../pages/PricingPage';
import { PricingCatalogPage } from '../pages/PricingCatalogPage';
import { SavedProposalsPage } from '../pages/SavedProposalsPage';
import { ProposalViewPage } from '../pages/ProposalViewPage';
import { LeadsPage } from '../pages/LeadsPage';
import { LeadCreatePage } from '../pages/LeadCreatePage';
import { LeadDetailPage } from '../pages/LeadDetailPage';
import { AutoTripTestPage } from '../pages/AutoTripTestPage';
import AutoAgentTestPage from '../pages/AutoAgentTestPage';
import FirestoreProbe from '../debug/FirestoreProbe';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/trip/new" element={<ProtectedRoute><TripBuilderPage /></ProtectedRoute>} />
      <Route path="/trip/:id/edit" element={<ProtectedRoute><TripDaysEditorPage /></ProtectedRoute>} />
      <Route path="/trip/:id/logistics" element={<ProtectedRoute><LogisticsPage /></ProtectedRoute>} />
      <Route path="/trip/:id/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
      <Route path="/trip/:id/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
      <Route path="/trip/:id/pricing/manual" element={<ProtectedRoute><ManualPricingPage /></ProtectedRoute>} />
      <Route path="/trip/:id/summary" element={<ProtectedRoute><TripSummaryPage /></ProtectedRoute>} />
      <Route path="/proposals" element={<ProtectedRoute><SavedProposalsPage /></ProtectedRoute>} />
      <Route path="/proposals/:id" element={<ProtectedRoute><ProposalViewPage /></ProtectedRoute>} />
      
      <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
      <Route path="/leads/new" element={<ProtectedRoute><LeadCreatePage /></ProtectedRoute>} />
      <Route path="/leads/:leadId" element={<ProtectedRoute><LeadDetailPage /></ProtectedRoute>} />
      
      <Route path="/admin/pricing-catalog" element={<ProtectedRoute requireAdmin><PricingCatalogPage /></ProtectedRoute>} />
      <Route path="/debug/firestore" element={<ProtectedRoute requireAdmin><FirestoreProbe /></ProtectedRoute>} />
      <Route path="/debug/auto-trip" element={<ProtectedRoute><AutoTripTestPage /></ProtectedRoute>} />
      <Route path="/debug/auto-agent" element={<ProtectedRoute><AutoAgentTestPage /></ProtectedRoute>} />
      
      <Route path="/trip" element={<Navigate to="/trip/new" replace />} />
      <Route path="/" element={<Navigate to="/trip/new" replace />} />
    </Routes>
  );
};

