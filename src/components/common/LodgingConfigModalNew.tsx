import React, { useState, useMemo } from 'react';
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

interface ExistingAllocation {
  roomTypeName: string;
  seasonName: string;
  occupancy: string;
  quantity: number;
  guests: number;
}

interface LodgingConfigModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName: string;
  metadata: LodgingMetadata;
  travelers: number;
  travelMonth?: number;
  onConfirm: (config: LodgingConfig) => void;
  existingAllocations?: ExistingAllocation[];
}

export const LodgingConfigModalNew: React.FC<LodgingConfigModalNewProps> = ({
  isOpen,
  onClose,
  hotelName,
  metadata,
  travelers,
  travelMonth,
  onConfirm,
  existingAllocations = [],
}) => {
  const getSeasonFromMonth = (month?: number): string | null => {
    if (!month) return null;
    if ([6, 7, 8, 9, 12, 1, 2].includes(month)) return 'peak';
    if ([3, 4, 5].includes(month)) return 'high';
    return 'low';
  };

  const autoDetectedSeason = getSeasonFromMonth(travelMonth);
  
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>(autoDetectedSeason || '');
  const [selectedOccupancy, setSelectedOccupancy] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [guests, setGuests] = useState<number>(1);

  const allocatedGuests = useMemo(() => {
    return existingAllocations.reduce((sum, alloc) => sum + alloc.guests, 0);
  }, [existingAllocations]);

  const remainingGuests = travelers - allocatedGuests;

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

    if (priceData.perRoom) return { price: priceData.perRoom, priceType: 'perRoom' };
    if (priceData.perPerson) return { price: priceData.perPerson, priceType: 'perPerson' };
    if (priceData.perVilla) return { price: priceData.perVilla, priceType: 'perVilla' };

    return null;
  };

  const priceInfo = calculatePrice();

  const calculateTotal = () => {
    if (!priceInfo) return 0;
    const { price, priceType } = priceInfo;
    
    if (priceType === 'perRoom' || priceType === 'perVilla') {
      return price * quantity;
    }
    return price * guests;
  };

  const formatOccupancyLabel = (occ: string): string => {
    const labels: Record<string, string> = {
      single: 'Single',
      sharing: 'Sharing',
      double: 'Double',
      triple: 'Triple',
      twoSingles: 'Two Singles',
      threePax: 'Three Pax',
      fourPax: 'Four Pax',
      villa: 'Villa',
      suite: 'Suite'
    };
    return labels[occ] || occ;
  };

  const handleConfirm = () => {
    if (!currentRoom || !selectedSeason || !selectedOccupancy || !priceInfo) return;

    const seasonName = metadata.seasons[selectedSeason]?.name || selectedSeason;

    onConfirm({
      hotelName,
      roomType: selectedRoom,
      roomTypeName: currentRoom.name,
      season: selectedSeason,
      seasonName,
      occupancy: selectedOccupancy,
      price: priceInfo.price,
      priceType: priceInfo.priceType,
      quantity,
      guests,
    });

    // Reset form for next allocation instead of closing modal
    setSelectedRoom('');
    setSelectedSeason(autoDetectedSeason || '');
    setSelectedOccupancy('');
    setQuantity(1);
    setGuests(1);
  };

  const handleClose = () => {
    setSelectedRoom('');
    setSelectedSeason(autoDetectedSeason || '');
    setSelectedOccupancy('');
    setQuantity(1);
    setGuests(1);
    onClose();
  };

  const isValid = selectedRoom && selectedSeason && selectedOccupancy && quantity > 0 && guests > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configure: {hotelName}</h2>
            <p className="text-sm text-gray-600 mt-1">Select room configuration</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Allocation Summary */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-900">{travelers}</div>
                <div className="text-xs text-blue-700">Total Travelers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{allocatedGuests}</div>
                <div className="text-xs text-green-700">Already Allocated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{remainingGuests}</div>
                <div className="text-xs text-orange-700">Remaining</div>
              </div>
            </div>
          </div>

          {/* Existing Allocations */}
          {existingAllocations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Allocations:</h3>
              <div className="space-y-2">
                {existingAllocations.map((alloc, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                    <span className="font-medium">{alloc.roomTypeName}</span> • {alloc.seasonName} • {formatOccupancyLabel(alloc.occupancy)} • 
                    <span className="font-semibold ml-1">{alloc.quantity} room{alloc.quantity > 1 ? 's' : ''} × {alloc.guests} guest{alloc.guests > 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selection Form */}
          <div className="space-y-6">
            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                value={selectedRoom}
                onChange={(e) => {
                  setSelectedRoom(e.target.value);
                  setSelectedOccupancy('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a room type...</option>
                {metadata.rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
              <select
                value={selectedSeason}
                onChange={(e) => {
                  setSelectedSeason(e.target.value);
                  setSelectedOccupancy('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a season...</option>
                {Object.entries(metadata.seasons).map(([key, season]) => (
                  <option key={key} value={key}>
                    {season.name} {key === autoDetectedSeason && '(Auto-detected)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Occupancy */}
            {availableOccupancies.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupancy (affects pricing)</label>
                <select
                  value={selectedOccupancy}
                  onChange={(e) => setSelectedOccupancy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select occupancy...</option>
                  {availableOccupancies.map((occ) => {
                    const priceData = currentRoom?.pricing[selectedSeason]?.[occ];
                    let priceDisplay = '';
                    
                    if (priceData) {
                      if (typeof priceData === 'number') {
                        priceDisplay = ` - $${priceData.toLocaleString()}/person`;
                      } else if (priceData.perRoom) {
                        priceDisplay = ` - $${priceData.perRoom.toLocaleString()}/room`;
                      } else if (priceData.perPerson) {
                        priceDisplay = ` - $${priceData.perPerson.toLocaleString()}/person`;
                      } else if (priceData.perVilla) {
                        priceDisplay = ` - $${priceData.perVilla.toLocaleString()}/villa`;
                      }
                    }
                    
                    return (
                      <option key={occ} value={occ}>
                        {formatOccupancyLabel(occ)}{priceDisplay}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Quantity and Guests - ALWAYS VISIBLE */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Rooms <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How many rooms?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Guests <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="How many guests?"
                />
              </div>
            </div>

            {/* Price Summary */}
            {priceInfo && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{currentRoom?.name}</span> • {metadata.seasons[selectedSeason]?.name} • {formatOccupancyLabel(selectedOccupancy)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      ${priceInfo.price.toLocaleString()}/{priceInfo.priceType === 'perRoom' ? 'room' : priceInfo.priceType === 'perVilla' ? 'villa' : 'person'}
                      {priceInfo.priceType === 'perPerson' && ` × ${guests} guests`}
                      {(priceInfo.priceType === 'perRoom' || priceInfo.priceType === 'perVilla') && ` × ${quantity} room${quantity > 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-700">
                      ${calculateTotal().toLocaleString()}
                    </div>
                    <div className="text-xs text-green-600">Total</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={handleClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid}
          >
            Add Room & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
