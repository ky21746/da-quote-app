import React, { useState } from 'react';
import { Button } from './Button';
import { X } from 'lucide-react';

interface LodgingMetadata {
  type: 'hierarchical';
  rooms: Array<{
    id: string;
    name: string;
    description?: string;
    pricing: {
      [season: string]: {
        [occupancy: string]: number | { perRoom?: number; perPerson?: number; perVilla?: number };
      };
    };
  }>;
  seasons: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
}

interface LodgingConfig {
  hotelName: string;
  roomType: string;
  roomTypeName: string;
  season: string;
  seasonName: string;
  occupancy: string;
  price: number;
  priceType: 'perRoom' | 'perPerson' | 'perVilla';
  requiredQuantity?: number;
  quantity?: number;
  guests?: number;
}

interface LodgingConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName: string;
  metadata: LodgingMetadata;
  travelers: number;
  travelMonth?: number; // 1-12 for Jan-Dec
  onConfirm: (config: LodgingConfig) => void;
  allowCustomQuantity?: boolean; // For multi-room allocation
}

export const LodgingConfigModal: React.FC<LodgingConfigModalProps> = ({
  isOpen,
  onClose,
  hotelName,
  metadata,
  travelers,
  travelMonth,
  onConfirm,
  allowCustomQuantity = false,
}) => {
  // Helper function to auto-detect season from travel month
  const getSeasonFromMonth = (month?: number): string | null => {
    if (!month) return null;
    
    // Peak: June-September, December-February
    if ([6, 7, 8, 9, 12, 1, 2].includes(month)) {
      return 'peak';
    }
    // High: March-May
    if ([3, 4, 5].includes(month)) {
      return 'high';
    }
    // Low: October-November
    return 'low';
  };

  const autoDetectedSeason = getSeasonFromMonth(travelMonth);
  
  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>(autoDetectedSeason || '');
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>('');
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [customGuests, setCustomGuests] = useState<number>(0);

  if (!isOpen) return null;

  const currentRoom = metadata.rooms.find(r => r.id === selectedRoom);
  const availableOccupancies = currentRoom && selectedSeason
    ? Object.keys(currentRoom.pricing[selectedSeason] || {})
    : [];

  const calculatePrice = (): { price: number; priceType: 'perRoom' | 'perPerson' | 'perVilla' } | null => {
    if (!currentRoom || !selectedSeason || !selectedOccupancy) return null;
    
    const priceData = currentRoom.pricing[selectedSeason]?.[selectedOccupancy];
    if (!priceData) return null;

    if (typeof priceData === 'number') {
      return { price: priceData, priceType: 'perPerson' };
    }

    if (priceData.perRoom) {
      return { price: priceData.perRoom, priceType: 'perRoom' };
    }
    if (priceData.perPerson) {
      return { price: priceData.perPerson, priceType: 'perPerson' };
    }
    if (priceData.perVilla) {
      return { price: priceData.perVilla, priceType: 'perVilla' };
    }

    return null;
  };

  const priceInfo = calculatePrice();

  const handleConfirm = () => {
    if (!currentRoom || !selectedSeason || !selectedOccupancy || !priceInfo) return;

    const seasonInfo = metadata.seasons[selectedSeason];
    
    // Calculate required quantity based on travelers and room capacity
    const occupancyCountMap: Record<string, number> = {
      'single': 1,
      'sharing': 2,
      'double': 2,
      'triple': 3,
      'twoSingles': 2,
      'threePax': 3,
      'fourPax': 4,
      'villa': 8,
      'suite': 2
    };
    const guestsInRoom = occupancyCountMap[selectedOccupancy] || 1;
    const requiredQuantity = travelers > 0 ? Math.ceil(travelers / guestsInRoom) : 1;
    
    onConfirm({
      hotelName,
      roomType: selectedRoom,
      roomTypeName: currentRoom.name,
      season: selectedSeason,
      seasonName: seasonInfo.name,
      occupancy: selectedOccupancy,
      price: priceInfo.price,
      priceType: priceInfo.priceType,
      requiredQuantity,
      quantity: allowCustomQuantity ? customQuantity : undefined,
      guests: allowCustomQuantity ? customGuests : undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setSelectedRoom('');
    setSelectedSeason('');
    setSelectedOccupancy('');
    setCustomQuantity(1);
    setCustomGuests(0);
    onClose();
  };

  const formatOccupancyLabel = (key: string): string => {
    const labels: Record<string, string> = {
      'double': 'Adult Double',
      'single': 'Adult Single',
      'triple': 'Triple Occupancy',
      'child_5_15': 'Child 5-15 years',
      'child_0_4': 'Child 0-4 years (FOC)',
      'villa': 'Villa (1-8 guests)',
    };
    return labels[key] || key;
  };

  const formatPrice = (price: number, type: string): string => {
    if (price === 0) return 'FOC';
    const suffix = type === 'perRoom' ? '/room' : type === 'perVilla' ? '/villa' : '/person';
    return `$${price.toLocaleString()}${suffix}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configure: {hotelName}</h2>
            <p className="text-sm text-gray-500 mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Room Type</span>
            <span className={`text-xs font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Season</span>
            <span className={`text-xs font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Occupancy</span>
          </div>
          <div className="flex gap-2">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Room Type */}
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Room Type</h3>
              <div className="space-y-3">
                {metadata.rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedRoom === room.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{room.name}</div>
                    {room.description && (
                      <div className="text-sm text-gray-600 mt-1">{room.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Season */}
          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Season</h3>
              {autoDetectedSeason && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ Season auto-detected from travel month: <strong>{metadata.seasons[autoDetectedSeason]?.name || autoDetectedSeason}</strong>
                  </p>
                </div>
              )}
              <div className="space-y-3">
                {Object.entries(metadata.seasons).map(([key, season]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedSeason(key)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedSeason === key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{season.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{season.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Occupancy */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Occupancy</h3>
              
              {/* Custom Quantity and Guests (for multi-room allocation) - SHOW FIRST */}
              {allowCustomQuantity && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-sm font-semibold text-purple-800 mb-3">🏠 Specify Allocation:</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Number of Rooms</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={customQuantity}
                        onChange={(e) => setCustomQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Number of Guests</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={customGuests}
                        onChange={(e) => setCustomGuests(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-purple-700">
                    This will add <strong>{customQuantity}</strong> room{customQuantity > 1 ? 's' : ''} for <strong>{customGuests}</strong> guest{customGuests > 1 ? 's' : ''}
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {availableOccupancies.map((occupancy) => {
                  const priceData = currentRoom?.pricing[selectedSeason]?.[occupancy];
                  let price = 0;
                  let priceType = 'perPerson';

                  if (typeof priceData === 'number') {
                    price = priceData;
                  } else if (priceData) {
                    if (priceData.perRoom) {
                      price = priceData.perRoom;
                      priceType = 'perRoom';
                    } else if (priceData.perPerson) {
                      price = priceData.perPerson;
                      priceType = 'perPerson';
                    } else if (priceData.perVilla) {
                      price = priceData.perVilla;
                      priceType = 'perVilla';
                    }
                  }

                  // Calculate suite total based on occupancy
                  const occupancyCountMap: Record<string, number> = {
                    'single': 1,
                    'sharing': 2,
                    'double': 2,
                    'triple': 3,
                    'twoSingles': 2,
                    'threePax': 3,
                    'fourPax': 4,
                    'villa': 8,
                    'suite': 2
                  };
                  const guestsInRoom = occupancyCountMap[occupancy] || 1;
                  const suiteTotal = priceType === 'perPerson' ? price * guestsInRoom : price;
                  
                  // Calculate rooms needed based on travelers
                  const roomsNeeded = travelers > 0 ? Math.ceil(travelers / guestsInRoom) : 1;
                  const needsMultipleRooms = roomsNeeded > 1;
                  const totalCostForAllRooms = suiteTotal * roomsNeeded;

                  return (
                    <button
                      key={occupancy}
                      onClick={() => setSelectedOccupancy(occupancy)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedOccupancy === occupancy
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">
                              {formatOccupancyLabel(occupancy)}
                            </div>
                            {priceType === 'perPerson' && (
                              <div className="text-sm text-gray-600 mt-1">
                                ${price.toLocaleString()} per person × {guestsInRoom} guests
                              </div>
                            )}
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              ${suiteTotal.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {priceType === 'perRoom' ? 'per room' : priceType === 'perVilla' ? 'per villa' : 'suite total'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Room recommendation warning - ONLY show when NOT using custom allocation */}
                        {!allowCustomQuantity && needsMultipleRooms && travelers > 0 && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
                            <div className="flex items-start gap-2">
                              <span className="text-lg">⚠️</span>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-amber-900">
                                  You need {roomsNeeded} rooms for {travelers} travelers
                                </div>
                                <div className="text-xs text-amber-800 mt-1">
                                  Each room accommodates {guestsInRoom} guest{guestsInRoom > 1 ? 's' : ''}. You'll need to add this room {roomsNeeded} times.
                                </div>
                                <div className="text-sm font-bold text-amber-900 mt-2 pt-2 border-t border-amber-200">
                                  Total for {roomsNeeded} rooms: ${totalCostForAllRooms.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              {priceInfo && !allowCustomQuantity && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-semibold text-green-800 mb-2">Selection Summary:</div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div><strong>Room:</strong> {currentRoom?.name}</div>
                    <div><strong>Season:</strong> {metadata.seasons[selectedSeason].name}</div>
                    <div><strong>Occupancy:</strong> {formatOccupancyLabel(selectedOccupancy)}</div>
                    <div className="pt-2 border-t border-green-300 mt-2">
                      <strong>Price:</strong> {formatPrice(priceInfo.price, priceInfo.priceType)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div>
            {step > 1 && (
              <Button
                onClick={() => setStep(step - 1)}
                variant="secondary"
              >
                ← Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClose} variant="secondary">
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                variant="primary"
                disabled={(step === 1 && !selectedRoom) || (step === 2 && !selectedSeason)}
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                variant="primary"
                disabled={!selectedOccupancy}
              >
                Add to Trip
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
