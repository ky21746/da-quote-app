import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { Button, ProgressStepper } from '../common';
import { ParksSection } from '../Parks';
import { validateNights } from '../../utils/tripValidation';

export const TripDaysEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft, referenceNumber } = useTrip();
  
  const tripDays = draft?.tripDays || [];
  const totalDays = draft?.days || 0;

  const missingParkDays = Array.from({ length: totalDays }, (_, i) => i + 1)
    .filter((dayNumber) => {
      const day = tripDays[dayNumber - 1];
      return !day?.parkId;
    });
  
  const nightsValidation = draft 
    ? validateNights(draft.days, draft.parks || [])
    : { valid: false, totalNights: 0, message: '' };
  
  // Use tripDays validation if available, otherwise fall back to parks validation
  const parksValid = missingParkDays.length === 0;

  const blockedReason = !parksValid ? `Park missing on Day ${missingParkDays[0]}` : null;

  const canProceed = draft?.tripDays
    ? parksValid
    : nightsValidation.valid;

  const progressSteps = [
    'Setup',
    'Parks',
    'Logistics',
    'Pricing',
  ];

  const formatReferenceNumber = (n: number) => {
    return `217-${String(n - 217000).padStart(3, '0')}`;
  };

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Parks</h1>

        <ProgressStepper currentStep={2} steps={progressSteps} />

        {/* Read-only summary */}
        <div className="mb-6 p-4 md:p-6 bg-gray-50 rounded-lg">
          <h2 className="font-semibold text-gray-700 mb-3">Trip Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {typeof referenceNumber === 'number' && (
              <div>
                <span className="font-medium">Proposal Ref:</span> {formatReferenceNumber(referenceNumber)}
              </div>
            )}
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

        {/* Parks Section */}
        <ParksSection />

        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <div className="flex flex-col">
            {draft?.tripDays && !canProceed && blockedReason && (
              <div className="mb-2 text-sm text-red-700">
                Cannot continue: {blockedReason}
              </div>
            )}
            <Button
              onClick={() => navigate(`/trip/${id}/logistics`)}
              variant="primary"
              disabled={!canProceed}
            >
              Next: Logistics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

