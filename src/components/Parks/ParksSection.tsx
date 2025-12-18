import React from 'react';
import { useTrip } from '../../context/TripContext';
import { Button } from '../common';
import { ParkCard } from './ParkCard';

export const ParksSection: React.FC = () => {
  const { draft, addParkCard, updateParkCard, removeParkCard } = useTrip();

  const parks = draft?.parks || [];

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Parks</h2>
        <Button onClick={addParkCard} variant="primary">
          + Add Park
        </Button>
      </div>

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


