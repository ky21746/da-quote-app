import React from 'react';
import { useTrip } from '../../context/TripContext';
import { Button } from '../common';
import { ParkCard } from './ParkCard';
import { validateNights } from '../../utils/tripValidation';

export const ParksSection: React.FC = () => {
  const { draft, addParkCard, updateParkCard, removeParkCard } = useTrip();

  const parks = draft?.parks || [];
  const totalDays = draft?.days || 0;
  const nightsValidation = validateNights(totalDays, parks);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-brand-dark">Parks</h2>
        <Button onClick={addParkCard} variant="primary">
          + Add Park
        </Button>
      </div>

      {/* Nights Validation Display */}
      {parks.length > 0 && (
        <div className={`mb-4 p-3 rounded-lg border ${
          nightsValidation.valid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className={`text-sm font-medium ${
            nightsValidation.valid 
              ? 'text-green-800' 
              : 'text-orange-800'
          }`}>
            {nightsValidation.valid ? '✓' : '⚠'} {nightsValidation.message}
          </div>
          {totalDays > 0 && (
            <div className={`text-xs mt-1 ${
              nightsValidation.valid 
                ? 'text-green-600' 
                : 'text-orange-600'
            }`}>
              Trip: {totalDays} days | Allocated: {nightsValidation.totalNights} nights
            </div>
          )}
        </div>
      )}

      {parks.length === 0 ? (
        <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500">
          No parks added yet. Click "+ Add Park" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {parks.map((card) => (
            <ParkCard
              key={card.id}
              card={card}
              onUpdate={(updates) => updateParkCard(card.id, updates)}
              onRemove={() => removeParkCard(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};



