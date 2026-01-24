import React, { useState } from 'react';
import { generateAutoTrip, validateAutoTrip, estimateTripCost, type AutoTripRequest } from '../services/AutoItineraryBuilder';

export default function AutoAgentTestPage() {
  const [result, setResult] = useState<any>(null);

  const runTest = () => {
    const request: AutoTripRequest = {
      travelers: { adults: 2, children: [8, 12] },
      durationDays: 5,
      budgetTier: 'Luxury',
      focus: 'Gorillas'
    };

    const trip = generateAutoTrip(request);
    const warnings = validateAutoTrip(trip);
    const cost = estimateTripCost(trip);

    console.log('=== AUTO ITINERARY BUILDER TEST ===');
    console.log('Request:', request);
    console.log('Generated Trip:', trip);
    console.log('Validation Warnings:', warnings);
    console.log('Cost Estimate:', cost);
    console.log('=== Full JSON ===');
    console.log(JSON.stringify(trip, null, 2));

    setResult({ trip, warnings, cost, request });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Auto Itinerary Builder - Test Page</h1>
        
        <button
          onClick={runTest}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mb-6"
        >
          Run Test
        </button>

        {result && (
          <div className="space-y-6">
            {/* Request */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-3">Request</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(result.request, null, 2)}
              </pre>
            </div>

            {/* Validation Warnings */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-3">Validation Warnings</h2>
              {result.warnings.length > 0 ? (
                <div className="space-y-2">
                  {result.warnings.map((warning: string, idx: number) => (
                    <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <p className="text-yellow-800">{warning}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-green-600">✅ No warnings</p>
              )}
            </div>

            {/* Cost Estimate */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-3">Cost Estimate</h2>
              <div className="text-3xl font-bold text-green-600 mb-4">
                ${result.cost.estimatedTotal.toLocaleString()}
              </div>
              <div className="space-y-2">
                {result.cost.breakdown.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.category}</span>
                    <span className="font-medium">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Trip */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-3">Generated Trip</h2>
              <div className="space-y-3 mb-4">
                <div><strong>Name:</strong> {result.trip.name}</div>
                <div><strong>Travelers:</strong> {result.trip.travelers}</div>
                <div><strong>Days:</strong> {result.trip.days}</div>
                <div><strong>Tier:</strong> {result.trip.tier}</div>
                <div><strong>Ages:</strong> {result.trip.ages?.join(', ')}</div>
              </div>
              
              <h3 className="font-semibold mb-2">Day-by-Day Itinerary:</h3>
              <div className="space-y-3">
                {result.trip.tripDays?.map((day: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded">
                    <div className="font-medium mb-2">Day {day.dayNumber}</div>
                    {day.parkId && <div className="text-sm text-gray-600">Park: {day.parkId}</div>}
                    {day.lodging && <div className="text-sm text-gray-600">Lodging: {day.lodging}</div>}
                    {day.arrival && <div className="text-sm text-gray-600">Arrival: {day.arrival}</div>}
                    {day.activities.length > 0 && (
                      <div className="text-sm text-gray-600">
                        Activities: {day.activities.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Full JSON */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-3">Full JSON Output</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-xs max-h-96">
                {JSON.stringify(result.trip, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
