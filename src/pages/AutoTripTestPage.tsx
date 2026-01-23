import React, { useState } from 'react';
import { buildAutoTripSimple, getSeason, getSeasonName } from '../utils/autoTripBuilder';
import { validateTrip, calculateRoomAllocation } from '../utils/tripValidations';
import { TripTier } from '../types/ui';
import { Input, Select, Button } from '../components/common';

/**
 * Test page for Auto-Trip-Builder
 * This page allows testing the auto-trip-builder logic before integrating with AI agent
 */
export const AutoTripTestPage: React.FC = () => {
  const [formData, setFormData] = useState({
    travelers: 2,
    ages: [30, 30],
    days: 7,
    travelMonth: new Date().getMonth() + 1,
    tier: 'standard' as TripTier,
    tripName: '',
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    try {
      setError(null);
      const output = buildAutoTripSimple({
        travelers: formData.travelers,
        ages: formData.ages,
        days: formData.days,
        travelMonth: formData.travelMonth,
        tier: formData.tier,
        tripName: formData.tripName || undefined,
      });
      
      // Add validations
      const warnings = validateTrip({
        ages: formData.ages,
        parks: output.recommendedParks,
        travelMonth: formData.travelMonth,
      });
      
      const roomAllocation = calculateRoomAllocation(formData.ages);
      
      setResult({
        ...output,
        warnings,
        roomAllocation,
      });
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🤖 Auto-Trip-Builder Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the AI agent trip generation logic
          </p>

          {/* Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Trip Name (optional)"
              value={formData.tripName}
              onChange={(value) => setFormData({ ...formData, tripName: value as string })}
              placeholder="e.g., Uganda Safari Adventure"
            />

            <Input
              label="Number of Travelers"
              type="number"
              value={formData.travelers}
              onChange={(value) => {
                const newTravelers = value as number;
                const currentAges = formData.ages;
                let newAges = [...currentAges];
                
                if (newTravelers > currentAges.length) {
                  const diff = newTravelers - currentAges.length;
                  newAges = [...currentAges, ...Array(diff).fill(30)];
                } else if (newTravelers < currentAges.length) {
                  newAges = currentAges.slice(0, newTravelers);
                }
                
                setFormData({ ...formData, travelers: newTravelers, ages: newAges });
              }}
              min={1}
              required
            />

            <Input
              label="Number of Days"
              type="number"
              value={formData.days}
              onChange={(value) => setFormData({ ...formData, days: value as number })}
              min={1}
              required
            />

            <Select
              label="Travel Month"
              value={String(formData.travelMonth)}
              onChange={(value) => setFormData({ ...formData, travelMonth: Number(value) })}
              options={[
                { value: '1', label: 'January' },
                { value: '2', label: 'February' },
                { value: '3', label: 'March' },
                { value: '4', label: 'April' },
                { value: '5', label: 'May' },
                { value: '6', label: 'June' },
                { value: '7', label: 'July' },
                { value: '8', label: 'August' },
                { value: '9', label: 'September' },
                { value: '10', label: 'October' },
                { value: '11', label: 'November' },
                { value: '12', label: 'December' },
              ]}
              required
            />

            <Select
              label="Trip Level"
              value={formData.tier}
              onChange={(value) => setFormData({ ...formData, tier: value as TripTier })}
              options={[
                { value: 'budget', label: 'Budget' },
                { value: 'standard', label: 'Standard' },
                { value: 'luxury', label: 'Luxury' },
                { value: 'ultra-luxury', label: 'Ultra Luxury' },
              ]}
              required
            />
          </div>

          {/* Ages Grid */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ages (per traveler)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {formData.ages.map((age, index) => (
                <Input
                  key={index}
                  label={`Traveler ${index + 1}`}
                  type="number"
                  value={age}
                  onChange={(value) => {
                    const newAges = [...formData.ages];
                    newAges[index] = value as number;
                    setFormData({ ...formData, ages: newAges });
                  }}
                  min={0}
                  max={120}
                  required
                />
              ))}
            </div>
          </div>

          {/* Season Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Season:</strong> {getSeasonName(formData.travelMonth)}
            </p>
          </div>

          {/* Generate Button */}
          <Button onClick={handleGenerate} variant="primary" size="lg">
            🚀 Generate Trip
          </Button>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results Display */}
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ✅ Generated Trip
            </h2>

            {/* Trip Summary */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                {result.draft.name}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Travelers</p>
                  <p className="font-semibold text-gray-800">{result.draft.travelers}</p>
                </div>
                <div>
                  <p className="text-gray-600">Days</p>
                  <p className="font-semibold text-gray-800">{result.draft.days}</p>
                </div>
                <div>
                  <p className="text-gray-600">Month</p>
                  <p className="font-semibold text-gray-800">
                    {getSeasonName(result.draft.travelMonth || 1)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Level</p>
                  <p className="font-semibold text-gray-800 capitalize">{result.draft.tier}</p>
                </div>
              </div>
            </div>

            {/* Warnings & Validations */}
            {result.warnings && result.warnings.length > 0 && (
              <div className="mb-6 space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  ⚠️ Validations & Warnings
                </h3>
                {result.warnings.map((warning: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      warning.severity === 'error'
                        ? 'bg-red-50 border-red-200'
                        : warning.severity === 'warning'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <p className={`font-semibold mb-1 ${
                      warning.severity === 'error'
                        ? 'text-red-800'
                        : warning.severity === 'warning'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                    }`}>
                      {warning.message}
                    </p>
                    {warning.suggestion && (
                      <p className={`text-sm ${
                        warning.severity === 'error'
                          ? 'text-red-700'
                          : warning.severity === 'warning'
                          ? 'text-yellow-700'
                          : 'text-blue-700'
                      }`}>
                        💡 {warning.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Room Allocation */}
            {result.roomAllocation && (
              <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">
                  🏨 Smart Room Allocation
                </h3>
                <p className="text-purple-900 font-medium mb-2">
                  {result.roomAllocation.explanation}
                </p>
                <div className="text-sm text-purple-700">
                  <p><strong>Total Rooms:</strong> {result.roomAllocation.totalRooms}</p>
                  {result.roomAllocation.breakdown.map((room: any, index: number) => (
                    <p key={index}>
                      Room {index + 1}: {room.adults} adult{room.adults !== 1 ? 's' : ''}
                      {room.children > 0 && `, ${room.children} child${room.children !== 1 ? 'ren' : ''}`}
                      {' '}({room.roomType})
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Parks */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                🏞️ Recommended Parks
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.recommendedParks.map((parkId: string) => (
                  <span
                    key={parkId}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
                  >
                    {parkId}
                  </span>
                ))}
              </div>
            </div>

            {/* Trip Days Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                📅 Trip Days Breakdown
              </h3>
              <div className="space-y-2">
                {result.draft.tripDays?.map((day: any) => (
                  <div
                    key={day.dayNumber}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">
                        Day {day.dayNumber}
                      </span>
                      <span className="text-sm text-gray-600 px-2 py-1 bg-white rounded">
                        {day.parkId}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ages Breakdown */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                👥 Travelers Ages
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.draft.ages?.map((age: number, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    Traveler {index + 1}: {age} years
                  </span>
                ))}
              </div>
            </div>

            {/* Raw JSON (for debugging) */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-800">
                🔍 View Raw JSON
              </summary>
              <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};
