import React, { useState } from 'react';
import { ParkCard as ParkCardType } from '../../types/ui';
import { Select, MultiSelect, Input } from '../common';
import {
  MOCK_PARKS,
  MOCK_ARRIVAL,
  MOCK_LODGING,
  MOCK_TRANSPORT,
  MOCK_ACTIVITIES,
  MOCK_EXTRAS,
  MOCK_LOGISTICS_ARRIVAL,
  MOCK_LOGISTICS_VEHICLE,
  MOCK_LOGISTICS_INTERNAL,
  getFilteredOptions,
} from '../../data/mockCatalog';

interface ParkCardProps {
  card: ParkCardType;
  onUpdate: (updates: Partial<ParkCardType>) => void;
  onRemove: () => void;
}

export const ParkCard: React.FC<ParkCardProps> = ({ card, onUpdate, onRemove }) => {
  const [isLogisticsOpen, setIsLogisticsOpen] = useState(false);
  
  const filteredArrival = getFilteredOptions(MOCK_ARRIVAL, card.parkId);
  const filteredLodging = getFilteredOptions(MOCK_LODGING, card.parkId);
  const filteredTransport = getFilteredOptions(MOCK_TRANSPORT, card.parkId);
  const filteredActivities = getFilteredOptions(MOCK_ACTIVITIES, card.parkId);
  const filteredExtras = getFilteredOptions(MOCK_EXTRAS, card.parkId);
  
  // Logistics options (filtered by parkId)
  const filteredLogisticsArrival = getFilteredOptions(MOCK_LOGISTICS_ARRIVAL, card.parkId);
  const filteredLogisticsVehicle = getFilteredOptions(MOCK_LOGISTICS_VEHICLE, card.parkId);
  const filteredLogisticsInternal = getFilteredOptions(MOCK_LOGISTICS_INTERNAL, card.parkId);
  
  const logistics = card.logistics || {
    internalMovements: [],
  };

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
          // When park changes, reset all dependent fields including logistics
          onUpdate({
            parkId: value || undefined,
            arrival: undefined,
            lodging: undefined,
            transport: undefined,
            activities: [],
            extras: [],
            logistics: {
              internalMovements: [],
            },
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

          {/* Logistics Section (Collapsible) */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={() => setIsLogisticsOpen(!isLogisticsOpen)}
              className="w-full flex justify-between items-center text-left mb-2"
            >
              <h4 className="font-semibold text-gray-700">Logistics</h4>
              <span className="text-gray-500">
                {isLogisticsOpen ? '−' : '+'}
              </span>
            </button>

            {isLogisticsOpen && (
              <div className="space-y-4 mt-4 pl-2">
                {/* Arrival / Movement Between Parks */}
                <Select
                  label="Arrival / Movement Between Parks"
                  value={logistics.arrival || ''}
                  onChange={(value) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        arrival: value || undefined,
                      },
                    })
                  }
                  options={[
                    { value: '', label: 'Select arrival/movement...' },
                    ...filteredLogisticsArrival.map((opt) => ({
                      value: opt.id,
                      label: `${opt.name}${opt.price ? ` - ${opt.price}` : ''}`,
                    })),
                  ]}
                />

                {/* Vehicle & Driver */}
                <Select
                  label="Vehicle & Driver"
                  value={logistics.vehicle || ''}
                  onChange={(value) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        vehicle: value || undefined,
                      },
                    })
                  }
                  options={[
                    { value: '', label: 'Select vehicle...' },
                    ...filteredLogisticsVehicle.map((opt) => ({
                      value: opt.id,
                      label: `${opt.name}${opt.price ? ` - ${opt.price}` : ''}`,
                    })),
                  ]}
                />

                {/* Internal Movements (Multi-select) */}
                <MultiSelect
                  label="Internal Movements"
                  selectedIds={logistics.internalMovements}
                  options={filteredLogisticsInternal}
                  onChange={(internalMovements) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        internalMovements,
                      },
                    })
                  }
                />

                {/* Notes (Optional) */}
                <Input
                  label="Notes (optional)"
                  value={logistics.notes || ''}
                  onChange={(value) =>
                    onUpdate({
                      logistics: {
                        ...logistics,
                        notes: value as string,
                      },
                    })
                  }
                  placeholder="Operator / planner notes..."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

