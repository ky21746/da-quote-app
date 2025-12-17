import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { Button, ProgressStepper } from '../common';
import { ManualPricingTable } from '../ManualPricing/ManualPricingTable';
import {
  generateManualPricingLines,
  calculateGrandTotal,
} from '../../utils/manualPricingHelpers';
import { ManualPricingLineItem } from '../../types/ui';

export const PricingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft } = useTrip();

  const progressSteps = [
    'Basic Setup',
    'Attractions & Parks',
    'Logistics',
    'Review & Pricing',
  ];

  // Generate initial lines from draft (only once)
  const [pricingLines, setPricingLines] = useState<ManualPricingLineItem[]>(() => {
    if (!draft) return [];
    return generateManualPricingLines(draft);
  });

  const handleUpdateLine = (lineId: string, updates: Partial<ManualPricingLineItem>) => {
    setPricingLines((prev) =>
      prev.map((line) => (line.id === lineId ? { ...line, ...updates } : line))
    );
  };

  // Calculate totals
  const travelers = draft?.travelers || 0;
  const days = draft?.days || 0;
  const nights = days; // Assuming nights = days

  const grandTotal = useMemo(() => {
    return calculateGrandTotal(pricingLines, travelers, days, nights);
  }, [pricingLines, travelers, days, nights]);

  const perPerson = travelers > 0 ? grandTotal / travelers : 0;

  // Validation: check if all required fields are filled
  const canProceed = pricingLines.every(
    (line) => line.optedOut || (line.basePrice !== null && line.costType !== '')
  );

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Draft not loaded</p>
          <Button onClick={() => navigate('/trip/new')}>Start New Trip</Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return `USD ${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Manual Pricing</h1>

        <ProgressStepper currentStep={4} steps={progressSteps} />

        {/* Manual Pricing Table */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Line Items</h2>
          <ManualPricingTable
            lines={pricingLines}
            travelers={travelers}
            days={days}
            nights={nights}
            onUpdateLine={handleUpdateLine}
          />
        </div>

        {/* Final Output Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Final Output</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Travelers:</span>
              <span className="font-semibold text-gray-800">{travelers}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-semibold text-gray-800">Grand Total:</span>
              <span className="font-bold text-lg text-gray-900">{formatCurrency(grandTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Final Price Per Person:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(perPerson)}</span>
            </div>
          </div>
        </div>

        {/* Validation Message */}
        {!canProceed && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-sm">
            Please fill in Base Price and Cost Type for all non-opted-out items before proceeding.
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <Button
            onClick={() => {
              if (canProceed) {
                navigate(`/trip/${id}/summary`);
              }
            }}
            variant="primary"
            disabled={!canProceed}
          >
            Proceed
          </Button>
        </div>
      </div>
    </div>
  );
};
