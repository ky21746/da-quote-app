import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../common';

interface EditHierarchicalPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  metadata: any;
  onSave: (updatedMetadata: any) => void;
}

export const EditHierarchicalPricingModal: React.FC<EditHierarchicalPricingModalProps> = ({
  isOpen,
  onClose,
  itemName,
  metadata,
  onSave,
}) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any>({});
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [showJsonView, setShowJsonView] = useState(false);

  useEffect(() => {
    if (metadata?.rooms) {
      setRooms(JSON.parse(JSON.stringify(metadata.rooms)));
    }
    if (metadata?.seasons) {
      setSeasons(JSON.parse(JSON.stringify(metadata.seasons)));
    }
  }, [metadata]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedMetadata = {
      ...metadata,
      rooms,
      seasons,
    };
    onSave(updatedMetadata);
    onClose();
  };

  const updateRoomPrice = (roomIndex: number, season: string, occupancy: string, field: 'perRoom' | 'perPerson' | 'perVilla', value: string) => {
    const newRooms = [...rooms];
    const numValue = parseFloat(value) || 0;
    
    if (!newRooms[roomIndex].pricing[season]) {
      newRooms[roomIndex].pricing[season] = {};
    }
    if (!newRooms[roomIndex].pricing[season][occupancy]) {
      newRooms[roomIndex].pricing[season][occupancy] = {};
    }
    
    if (typeof newRooms[roomIndex].pricing[season][occupancy] === 'number') {
      newRooms[roomIndex].pricing[season][occupancy] = numValue;
    } else {
      newRooms[roomIndex].pricing[season][occupancy][field] = numValue;
    }
    
    setRooms(newRooms);
  };

  const handleCancel = () => {
    setRooms(metadata?.rooms ? JSON.parse(JSON.stringify(metadata.rooms)) : []);
    setSeasons(metadata?.seasons ? JSON.parse(JSON.stringify(metadata.seasons)) : {});
    setEditingRoomIndex(null);
    onClose();
  };

  const getSeasonKeys = () => Object.keys(seasons);
  const getOccupancyKeys = (roomIndex: number) => {
    const room = rooms[roomIndex];
    if (!room?.pricing) return [];
    const firstSeason = Object.keys(room.pricing)[0];
    if (!firstSeason) return [];
    return Object.keys(room.pricing[firstSeason]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Hierarchical Pricing</h2>
            <p className="text-sm text-gray-600 mt-1">{itemName}</p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Toggle between Form and JSON view */}
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Edit Room Pricing</h3>
            <button
              onClick={() => setShowJsonView(!showJsonView)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showJsonView ? 'Switch to Form View' : 'View JSON (Advanced)'}
            </button>
          </div>

          {showJsonView ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Metadata (JSON) - Advanced Mode
              </label>
              <p className="text-xs text-red-600 mb-2">
                ⚠️ Warning: Editing JSON directly can break the pricing structure. Use Form View for safety.
              </p>
              <textarea
                value={JSON.stringify({ rooms, seasons, ...metadata }, null, 2)}
                readOnly
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Room List */}
              {rooms.map((room, roomIndex) => (
                <div key={roomIndex} className="border border-gray-300 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">{room.name}</h4>
                      {room.description && (
                        <p className="text-sm text-gray-600">{room.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setEditingRoomIndex(editingRoomIndex === roomIndex ? null : roomIndex)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {editingRoomIndex === roomIndex ? 'Close' : 'Edit Prices'}
                    </button>
                  </div>

                  {editingRoomIndex === roomIndex && (
                    <div className="mt-4 space-y-4">
                      {getSeasonKeys().map((seasonKey) => (
                        <div key={seasonKey} className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-gray-800 mb-3 capitalize">
                            {seasons[seasonKey]?.name || seasonKey}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {getOccupancyKeys(roomIndex).map((occupancy) => {
                              const priceData = room.pricing[seasonKey]?.[occupancy];
                              const isObject = typeof priceData === 'object' && priceData !== null;
                              
                              return (
                                <div key={occupancy} className="bg-white p-3 rounded border border-gray-200">
                                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {occupancy.replace(/_/g, ' ')}
                                  </label>
                                  {isObject ? (
                                    <div className="space-y-2">
                                      {priceData.perRoom !== undefined && (
                                        <div>
                                          <label className="text-xs text-gray-600">Per Room</label>
                                          <input
                                            type="number"
                                            value={priceData.perRoom || 0}
                                            onChange={(e) => updateRoomPrice(roomIndex, seasonKey, occupancy, 'perRoom', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                      )}
                                      {priceData.perPerson !== undefined && (
                                        <div>
                                          <label className="text-xs text-gray-600">Per Person</label>
                                          <input
                                            type="number"
                                            value={priceData.perPerson || 0}
                                            onChange={(e) => updateRoomPrice(roomIndex, seasonKey, occupancy, 'perPerson', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                      )}
                                      {priceData.perVilla !== undefined && (
                                        <div>
                                          <label className="text-xs text-gray-600">Per Villa</label>
                                          <input
                                            type="number"
                                            value={priceData.perVilla || 0}
                                            onChange={(e) => updateRoomPrice(roomIndex, seasonKey, occupancy, 'perVilla', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <input
                                      type="number"
                                      value={priceData || 0}
                                      onChange={(e) => {
                                        const newRooms = [...rooms];
                                        newRooms[roomIndex].pricing[seasonKey][occupancy] = parseFloat(e.target.value) || 0;
                                        setRooms(newRooms);
                                      }}
                                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {rooms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No rooms configured. Use JSON view to add rooms.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button onClick={handleCancel} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
