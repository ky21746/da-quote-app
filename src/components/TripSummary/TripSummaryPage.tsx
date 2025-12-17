import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { useScenarioComparison } from '../../hooks/useScenarioComparison';
import { Button } from '../common';
import { ValidationWarnings } from './ValidationWarnings';
import { PricingScenarioComparison } from './PricingScenarioComparison';
import { CostParetoPanel } from './CostParetoPanel';

export const TripSummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { calculationResult, draft, scenarioResults, setScenarioResults } = useTrip();
  const { calculateScenarios, isCalculating: isCalculatingScenarios, error: scenarioError } =
    useScenarioComparison();
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    // Load scenarios when comparison is enabled
    if (showComparison && draft && id && !scenarioResults.base) {
      calculateScenarios(id, draft).then((results) => {
        setScenarioResults(results);
      });
    }
  }, [showComparison, draft, id, scenarioResults.base, calculateScenarios, setScenarioResults]);

  if (!calculationResult) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No calculation result found.</p>
          <Button onClick={() => navigate('/trip/new')}>Start New Trip</Button>
        </div>
      </div>
    );
  }

  const { total, pricePerPerson, breakdown, markup, warnings } = calculationResult;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Trip Summary</h1>

        {draft && (
          <div className="mb-6 p-4 bg-gray-50 rounded">
            <h2 className="font-semibold text-gray-700 mb-2">{draft.name}</h2>
            <p className="text-sm text-gray-600">
              {draft.travelers} travelers • {draft.days} days • {draft.tier}
            </p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-lg font-semibold text-gray-700">Total Cost</span>
            <span className="text-2xl font-bold text-blue-600">{total}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-600">Price per Person</span>
            <span className="text-lg font-semibold text-gray-800">{pricePerPerson}</span>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Line-by-Line Breakdown</h3>
          {breakdown.map((category) => (
            <div key={category.category} className="mb-4 border-b border-gray-200 pb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700 capitalize">
                  {category.category}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {category.subtotal}
                </span>
              </div>
              <div className="ml-4 space-y-2">
                {category.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{item.description}</div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} × {item.unitPrice}
                      </div>
                    </div>
                    <span className="font-semibold text-gray-800 ml-4">{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {markup.value > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Markup ({markup.type === 'percent' ? `${markup.value}%` : 'Fixed'})
              </span>
              <span className="text-sm font-semibold text-gray-800">{markup.amount}</span>
            </div>
          </div>
        )}

        <ValidationWarnings warnings={warnings} />

        {/* Cost Pareto Panel - shown for selected scenario */}
        {!showComparison && <CostParetoPanel calculation={calculationResult} />}

        {/* Comparison Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition-colors"
          >
            {showComparison ? 'Hide Scenario Comparison' : 'Compare Scenarios'}
          </button>
        </div>

        {/* Scenario Comparison - shown when enabled */}
        {showComparison && (
          <>
            {isCalculatingScenarios && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
                Calculating scenarios...
              </div>
            )}
            {scenarioError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {scenarioError}
              </div>
            )}
            <PricingScenarioComparison scenarios={scenarioResults} />
            {scenarioResults.base && <CostParetoPanel calculation={scenarioResults.base} />}
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={() => navigate('/trip/new')} variant="secondary">
            New Trip
          </Button>
          <Button onClick={() => navigate(-1)} variant="primary">
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

