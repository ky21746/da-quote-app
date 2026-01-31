import React, { useState, useMemo } from 'react';
import { PricingItem } from '../../types/ui';
import { formatCurrency } from '../../utils/currencyFormatter';
import { isRouteRelevantForPark } from '../../utils/parkAirportMapping';
import { Helicopter, Plane, Car, ChevronRight, Star } from 'lucide-react';

interface AircraftSelectorProps {
  value: string | undefined;
  onChange: (pricingItemId: string | undefined) => void;
  items: PricingItem[];
  parkId?: string;
  direction?: 'arrival' | 'departure';
  isLoading?: boolean;
  disabled?: boolean;
  // Favorites support
  isArrivalFavorite?: (parkId: string, arrivalId: string) => boolean;
  onToggleFavorite?: (parkId: string, arrivalId: string) => void;
}

type AircraftType = 'helicopter' | 'fixed-wing' | 'vehicle';

interface ParsedAircraft {
  id: string;
  type: AircraftType;
  model: string;
  route: string;
  from: string;
  to: string;
  price: number;
  costType: string;
  capacity?: number;
  notes?: string;
}

export const AircraftSelector: React.FC<AircraftSelectorProps> = ({
  value,
  onChange,
  items,
  parkId,
  direction,
  isLoading = false,
  disabled = false,
  isArrivalFavorite,
  onToggleFavorite,
}) => {
  const [selectedType, setSelectedType] = useState<AircraftType | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const parseAircraftName = (name: string): { type: AircraftType; model: string; route: string; from: string; to: string } => {
    const parts = name.split('–').map(p => p.trim());
    
    let type: AircraftType = 'vehicle';
    if (name.toLowerCase().includes('helicopter')) type = 'helicopter';
    else if (name.toLowerCase().includes('fixed wing') || name.toLowerCase().includes('fixed-wing')) type = 'fixed-wing';
    else if (name.toLowerCase().includes('vehicle') || name.toLowerCase().includes('car') || name.toLowerCase().includes('4x4')) type = 'vehicle';

    const model = parts[1] || 'Standard';
    const route = parts[2] || name;
    
    const routeParts = route.split(' to ').map(p => p.trim());
    const from = routeParts[0] || '';
    const to = routeParts[1] || '';

    return { type, model, route, from, to };
  };

  const parsedAircraft = useMemo((): ParsedAircraft[] => {
    return items
      .filter(item => {
        // If no parkId specified, show all
        if (!parkId) return true;
        
        // Check if route is relevant for the selected park with direction
        return isRouteRelevantForPark(item.itemName, parkId, direction);
      })
      .map(item => {
        const parsed = parseAircraftName(item.itemName);
        return {
          id: item.id,
          type: parsed.type,
          model: parsed.model,
          route: parsed.route,
          from: parsed.from,
          to: parsed.to,
          price: item.basePrice,
          costType: item.costType,
          capacity: item.capacity,
          notes: item.notes,
        };
      });
  }, [items, parkId, direction]);

  const groupedByType = useMemo(() => {
    const groups: Record<AircraftType, ParsedAircraft[]> = {
      helicopter: [],
      'fixed-wing': [],
      vehicle: [],
    };

    parsedAircraft.forEach(aircraft => {
      groups[aircraft.type].push(aircraft);
    });

    return groups;
  }, [parsedAircraft]);

  // Group by model within selected type
  const groupedByModel = useMemo(() => {
    if (!selectedType) return {};
    
    const aircrafts = groupedByType[selectedType];
    const modelGroups: Record<string, ParsedAircraft[]> = {};
    
    aircrafts.forEach(aircraft => {
      const model = aircraft.model;
      if (!modelGroups[model]) {
        modelGroups[model] = [];
      }
      modelGroups[model].push(aircraft);
    });
    
    return modelGroups;
  }, [selectedType, groupedByType]);

  const getTypeSummary = (type: AircraftType) => {
    const aircrafts = groupedByType[type];
    if (aircrafts.length === 0) return null;

    const capacities = aircrafts.map(a => a.capacity).filter(Boolean);
    const maxCapacity = capacities.length > 0 ? Math.max(...capacities as number[]) : null;

    switch (type) {
      case 'helicopter':
        return {
          icon: <Helicopter className="w-8 h-8" />,
          title: 'Helicopter',
          description: 'Flexible landing, scenic views',
          capacity: maxCapacity ? `Up to ${maxCapacity} passengers` : 'Small groups',
          count: aircrafts.length,
        };
      case 'fixed-wing':
        return {
          icon: <Plane className="w-8 h-8" />,
          title: 'Fixed Wing Aircraft',
          description: 'Requires airstrip, cost-effective',
          capacity: maxCapacity ? `Up to ${maxCapacity} passengers` : 'Medium groups',
          count: aircrafts.length,
        };
      case 'vehicle':
        return {
          icon: <Car className="w-8 h-8" />,
          title: 'Ground Vehicle',
          description: 'Road access, flexible schedule',
          capacity: maxCapacity ? `Up to ${maxCapacity} passengers` : 'Small groups',
          count: aircrafts.length,
        };
    }
  };

  const selectedItem = parsedAircraft.find(a => a.id === value);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Loading aircraft options...</div>;
  }

  if (!selectedType) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Aircraft Type</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(['helicopter', 'fixed-wing', 'vehicle'] as AircraftType[]).map(type => {
            const summary = getTypeSummary(type);
            if (!summary || summary.count === 0) return null;

            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                disabled={disabled}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <div className="flex items-start gap-4">
                <div className="text-blue-600 group-hover:text-blue-700">
                  {summary.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{summary.title}</h4>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{summary.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {summary.capacity} • {summary.count} option{summary.count > 1 ? 's' : ''} available
                  </p>
                </div>
              </div>
            </button>
          );
        })}
        </div>

        {selectedItem && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xs font-medium text-green-800 mb-1">Currently Selected:</div>
                <div className="text-sm text-green-900">{selectedItem.model} • {selectedItem.route}</div>
                <button
                  onClick={() => onChange(undefined)}
                  className="text-xs text-green-700 underline mt-2 hover:text-green-900"
                >
                  Clear selection
                </button>
              </div>
              {parkId && isArrivalFavorite && onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(parkId, selectedItem.id);
                  }}
                  className={`p-2 rounded-lg transition-all ${
                    isArrivalFavorite(parkId, selectedItem.id)
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                      : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                  title={isArrivalFavorite(parkId, selectedItem.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-5 h-5 ${
                    isArrivalFavorite(parkId, selectedItem.id) ? 'fill-current' : ''
                  }`} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Select aircraft model (for fixed-wing with multiple models)
  if (selectedType && !selectedModel && selectedType === 'fixed-wing' && Object.keys(groupedByModel).length > 1) {
    const summary = getTypeSummary(selectedType);
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-blue-600">{summary?.icon}</div>
            <h3 className="text-sm font-medium text-gray-700">Select Aircraft Model</h3>
          </div>
          <button
            onClick={() => setSelectedType(null)}
            className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
          >
            ← Back to types
          </button>
        </div>

        {Object.entries(groupedByModel).map(([model, aircrafts]) => {
          const capacities = aircrafts.map(a => a.capacity).filter(Boolean);
          const maxCapacity = capacities.length > 0 ? Math.max(...capacities as number[]) : null;
          const routeCount = aircrafts.length;

          return (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              disabled={disabled}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{model}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {maxCapacity && `Capacity: ${maxCapacity} passengers`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {routeCount} route{routeCount > 1 ? 's' : ''} available
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  // Step 3: Select specific route
  const aircraftOptions = selectedModel 
    ? groupedByModel[selectedModel] 
    : groupedByType[selectedType!];
  const summary = getTypeSummary(selectedType!);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-blue-600">{summary?.icon}</div>
          <h3 className="text-sm font-medium text-gray-700">
            {selectedModel ? `${selectedModel} Routes` : `${summary?.title} Options`}
          </h3>
        </div>
        <button
          onClick={() => {
            if (selectedModel) {
              setSelectedModel(null);
            } else {
              setSelectedType(null);
            }
          }}
          className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
        >
          ← Back {selectedModel ? 'to models' : 'to types'}
        </button>
      </div>

      {aircraftOptions.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No {summary?.title.toLowerCase()} options available
        </div>
      ) : (
        <div className="space-y-2">
          {aircraftOptions.map(aircraft => (
            <button
              key={aircraft.id}
              onClick={() => {
                onChange(aircraft.id);
                setSelectedType(null);
                setSelectedModel(null);
              }}
              disabled={disabled}
              className={`w-full p-4 border-2 rounded-lg text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                value === aircraft.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{aircraft.model}</div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <span className="font-medium">{aircraft.from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium">{aircraft.to}</span>
                  </div>
                  {aircraft.capacity && (
                    <div className="text-xs text-gray-500 mt-1">
                      Capacity: {aircraft.capacity} passengers
                    </div>
                  )}
                  {aircraft.notes && (
                    <div className="text-xs text-gray-500 mt-1">{aircraft.notes}</div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(aircraft.price)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {aircraft.costType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
              {value === aircraft.id && (
                <div className="mt-2 text-xs text-green-700 font-medium">✓ Selected</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
