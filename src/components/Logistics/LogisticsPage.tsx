import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { Button, ProgressStepper } from '../common';
import { LogisticsSection } from './LogisticsSection';

export const LogisticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft } = useTrip();

  const progressSteps = [
    'Setup',
    'Parks',
    'Logistics',
    'Pricing',
  ];

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Draft not loaded</p>
          <Button onClick={() => navigate('/trip/new')}>Start New Trip</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8 lg:p-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Logistics</h1>

        <ProgressStepper currentStep={3} steps={progressSteps} />

        {/* Read-only summary */}
        <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg">
          <h2 className="font-semibold text-gray-700 mb-3">Trip Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Trip Name:</span> {draft.name}
            </div>
            <div>
              <span className="font-medium">Travelers:</span> {draft.travelers}
            </div>
            <div>
              <span className="font-medium">Days:</span> {draft.days}
            </div>
            <div>
              <span className="font-medium">Tier:</span> {draft.tier}
            </div>
          </div>
        </div>

        {/* Logistics Section - Only Logistics fields */}
        <LogisticsSection />

        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <Button
            onClick={() => navigate(`/trip/${id}/review`)}
            variant="primary"
          >
            Next: Pricing
          </Button>
        </div>
      </div>
    </div>
  );
};

