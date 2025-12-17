import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { useManualPricing } from '../../hooks/useManualPricing';
import { ManualPricingEditor } from './ManualPricingEditor';
import { Button } from '../common';
import { LineItemDraft } from '../../types/ui';

export const ManualPricingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft, setDraft, setCalculationResult } = useTrip();
  const { calculate, isCalculating, error } = useManualPricing();
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);

  useEffect(() => {
    if (draft?.manualLineItems) {
      setLineItems(draft.manualLineItems);
    }
  }, [draft]);

  const handleCalculate = async () => {
    if (lineItems.length === 0) {
      return;
    }

    // Update draft with manual line items
    if (draft) {
      const updatedDraft = {
        ...draft,
        manualLineItems: lineItems,
      };
      setDraft(updatedDraft);
    }

    // Calculate using manual pricing engine
    const result = await calculate(lineItems);
    if (!result) {
      return; // Error handled by hook
    }

    // Save result and navigate to summary
    setCalculationResult(result);
    navigate(`/trip/${id}/summary`);
  };

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No trip draft found.</p>
          <Button onClick={() => navigate('/trip/new')}>Start New Trip</Button>
        </div>
      </div>
    );
  }

  const total = lineItems.reduce((sum, item) => {
    if (item.pricingMode === 'PER_PERSON') {
      return sum + item.unitPrice * item.participants;
    } else {
      return sum + item.unitPrice * item.quantity;
    }
  }, 0);

  const pricePerPerson = draft.travelers > 0 ? total / draft.travelers : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Manual Pricing</h1>

        {draft && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h2 className="font-semibold text-gray-700 mb-2">{draft.name}</h2>
            <p className="text-sm text-gray-600">
              {draft.travelers} travelers • {draft.days} days
            </p>
          </div>
        )}

        <ManualPricingEditor
          lineItems={lineItems}
          participants={draft.travelers}
          onChange={setLineItems}
        />

        {lineItems.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600">Grand Total: </span>
                <span className="text-2xl font-bold text-blue-600">
                  ${total.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Per Person: </span>
                <span className="text-lg font-semibold text-gray-800">
                  ${pricePerPerson.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary" disabled={isCalculating}>
            Back
          </Button>
          <Button
            onClick={handleCalculate}
            variant="primary"
            disabled={isCalculating || lineItems.length === 0}
          >
            {isCalculating ? 'Calculating...' : 'Calculate & View Summary'}
          </Button>
        </div>
      </div>
    </div>
  );
};

