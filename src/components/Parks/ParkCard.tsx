import React from 'react';
import { ParkCard as ParkCardType } from '../../types/ui';
import { Select, MultiSelect } from '../common';
import {
  MOCK_PARKS,
  MOCK_ARRIVAL,
  MOCK_LODGING,
  MOCK_TRANSPORT,
  MOCK_ACTIVITIES,
  MOCK_EXTRAS,
  getFilteredOptions,
} from '../../data/mockCatalog';

interface ParkCardProps {
  card: ParkCardType;
  onUpdate: (updates: Partial<ParkCardType>) => void;
  onRemove: () => void;
}

export const ParkCard: React.FC<ParkCardProps> = ({ card, onUpdate, onRemove }) => {
  const filteredArrival = getFilteredOptions(MOCK_ARRIVAL, card.parkId);
  const filteredLodging = getFilteredOptions(MOCK_LODGING, card.parkId);
  const filteredTransport = getFilteredOptions(MOCK_TRANSPORT, card.parkId);
  const filteredActivities = getFilteredOptions(MOCK_ACTIVITIES, card.parkId);
  const filteredExtras = getFilteredOptions(MOCK_EXTRAS, card.parkId);

  const parkOptions = [
    { value: '', label: 'Select a park...' },
    ...MOCK_PARKS.map((park) => ({ value: park.id, label: park.name })),
  ];

  const arrivalOptions = [
    { value: '', label: 'Select arrival...' },
    ...filteredArrival.map((opt) => ({
      value: opt.id,
      label: `${opt.name}${opt.price ? ` - ${opt.price}` : ''}`,
    })),
  ];

  const lodgingOptions = [
    { value: '', label: 'Select lodging...' },
    ...filteredLodging.map((opt) => ({
      value: opt.id,
      label: `${opt.name}${opt.tier ? ` (${opt.tier})` : ''}${opt.price ? ` - ${opt.price}` : ''}`,
    })),
  ];

  const transportOptions = [
    { value: '', label: 'Select transport...' },
    ...filteredTransport.map((opt) => ({
      value: opt.id,
      label: `${opt.name}${opt.price ? ` - ${opt.price}` : ''}`,
    })),
  ];

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Park Card</h3>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Remove
        </button>
      </div>

      {/* Park Selector */}
      <Select
        label="Park"
        value={card.parkId || ''}
        onChange={(value) => {
          // When park changes, reset all dependent fields
          onUpdate({
            parkId: value || undefined,
            arrival: undefined,
            lodging: undefined,
            transport: undefined,
            activities: [],
            extras: [],
          });
        }}
        options={parkOptions}
      />

      {/* Categories shown only after park selected */}
      {card.parkId && (
        <div className="space-y-4 mt-4">
          {/* Arrival / Aviation */}
          <Select
            label="Arrival / Aviation"
            value={card.arrival || ''}
            onChange={(value) => onUpdate({ arrival: value || undefined })}
            options={arrivalOptions}
          />

          {/* Lodging */}
          <Select
            label="Lodging"
            value={card.lodging || ''}
            onChange={(value) => onUpdate({ lodging: value || undefined })}
            options={lodgingOptions}
          />

          {/* Local Transportation */}
          <Select
            label="Local Transportation"
            value={card.transport || ''}
            onChange={(value) => onUpdate({ transport: value || undefined })}
            options={transportOptions}
          />

          {/* Activities (Multi-select) */}
          <MultiSelect
            label="Activities"
            selectedIds={card.activities}
            options={filteredActivities}
            onChange={(activities) => onUpdate({ activities })}
          />

          {/* Extras (Multi-select) */}
          <MultiSelect
            label="Extras"
            selectedIds={card.extras}
            options={filteredExtras}
            onChange={(extras) => onUpdate({ extras })}
          />
        </div>
      )}
    </div>
  );
};

