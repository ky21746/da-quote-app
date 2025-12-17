import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { Button, ProgressStepper, Select, Input } from '../common';
import { calculatePricing, PricingResult } from '../../core/services/ParkCardPricingEngine';
import { MarkupType } from '../../types/ui';

export const PricingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft, setDraft } = useTrip();

  const [markupType, setMarkupType] = useState<MarkupType>('percent');
  const [markupValue, setMarkupValue] = useState<number>(0);

  const progressSteps = [
    'Basic Setup',
    'Attractions & Parks',
    'Logistics',
    'Review & Pricing',
  ];

  // Calculate pricing result
  const pricingResult: PricingResult | null = useMemo(() => {
    if (!draft) return null;
    return calculatePricing(draft);
  }, [draft]);

  if (!draft || !pricingResult) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Draft not loaded</p>
          <Button onClick={() => navigate('/trip/new')}>Start New Trip</Button>
        </div>
      </div>
    );
  }

  // Calculate markup
  const baseTotal = pricingResult.totals.grandTotal;
  const markupAmount =
    markupType === 'percent'
      ? (baseTotal * markupValue) / 100
      : markupValue;
  const finalTotal = baseTotal + markupAmount;
  const finalPerPerson = draft.travelers > 0 ? finalTotal / draft.travelers : 0;

  const formatCurrency = (amount: number): string => {
    return `USD ${amount.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pricing</h1>

        <ProgressStepper currentStep={4} steps={progressSteps} />

        {/* Line-item Breakdown Table */}
        <div className="mb-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Line-Item Breakdown</h2>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Park</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Item</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Pricing Model</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Base Price</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Calculation</th>
                <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {pricingResult.breakdown.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2">{item.parkName}</td>
                  <td className="border border-gray-300 px-3 py-2">{item.category}</td>
                  <td className="border border-gray-300 px-3 py-2 font-medium">{item.itemName}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {item.pricingModel}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right">
                    {formatCurrency(item.basePrice)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600">
                    {item.calculationExplanation}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                    {formatCurrency(item.calculatedTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Base Totals</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Grand Total:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(baseTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price Per Person:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(pricingResult.totals.perPerson)}</span>
            </div>
          </div>
        </div>

        {/* Markup Section */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Markup</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select
              label="Markup Type"
              value={markupType}
              onChange={(value) => setMarkupType(value as MarkupType)}
              options={[
                { value: 'percent', label: 'Percent (%)' },
                { value: 'fixed', label: 'Fixed Amount' },
              ]}
            />
            <Input
              label={markupType === 'percent' ? 'Markup Value (%)' : 'Markup Value (USD)'}
              type="number"
              value={markupValue}
              onChange={(value) => setMarkupValue(value as number)}
              min={0}
              step={markupType === 'percent' ? 1 : 0.01}
            />
          </div>
          <div className="space-y-2 text-sm pt-3 border-t border-yellow-200">
            <div className="flex justify-between">
              <span className="text-gray-600">Base Total:</span>
              <span className="text-gray-800">{formatCurrency(baseTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                Markup ({markupType === 'percent' ? `${markupValue}%` : formatCurrency(markupValue)}):
              </span>
              <span className="text-gray-800">{formatCurrency(markupAmount)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-yellow-200">
              <span className="font-semibold text-gray-800">Final Total:</span>
              <span className="font-bold text-lg text-gray-900">{formatCurrency(finalTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Final Price Per Person:</span>
              <span className="font-semibold text-gray-800">{formatCurrency(finalPerPerson)}</span>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <Button
            onClick={() => {
              // Save markup to draft
              setDraft({
                ...draft,
                markup: {
                  type: markupType,
                  value: markupValue,
                },
              });
              // Navigate to summary (future)
              navigate(`/trip/${id}/summary`);
            }}
            variant="primary"
          >
            Save & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

