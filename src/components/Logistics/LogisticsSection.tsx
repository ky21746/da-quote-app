import React from 'react';
import { useTrip } from '../../context/TripContext';
import { usePricingCatalog } from '../../context/PricingCatalogContext';
import { getParks, assertValidParkId } from '../../utils/parks';
import { 
  Calendar, 
  Plane, 
  Car, 
  MapPin, 
  FileText, 
  Home, 
  Activity,
  CheckCircle2 
} from 'lucide-react';

export const LogisticsSection: React.FC = () => {
  const { draft } = useTrip();
  const { items: pricingItems } = usePricingCatalog();

  const tripDays = draft?.tripDays || [];

  if (tripDays.length === 0) {
    return (
      <div className="p-4 md:p-6 border border-gray-200 rounded-lg text-center text-gray-500">
        No trip days configured yet. Please configure days in the previous step.
      </div>
    );
  }

  // Helper function to get item name by ID
  const getItemName = (itemId?: string): string => {
    if (!itemId) return 'Not selected';
    const item = pricingItems.find((i) => i.id === itemId);
    return item?.itemName || 'Unknown item';
  };

  // Helper function to get park name by ID
  const getParkName = (parkId?: string): string => {
    if (!parkId) return 'No park selected';
    try {
      assertValidParkId(parkId);
      return getParks().find((p) => p.id === parkId)?.label || parkId;
    } catch {
      return parkId;
    }
  };

  // Filter days that have any data
  const daysWithData = tripDays.filter((day) => {
    return (
      day.parkId ||
      day.arrival ||
      day.lodging ||
      (day.activities && day.activities.length > 0) ||
      day.logistics?.vehicle ||
      (day.logistics?.internalMovements && day.logistics.internalMovements.length > 0) ||
      day.logistics?.notes
    );
  });

  if (daysWithData.length === 0) {
    return (
      <div className="p-4 md:p-6 border border-gray-200 rounded-lg text-center text-gray-500">
        <Calendar size={24} className="mx-auto mb-2 text-gray-400" />
        <p>No trip days configured yet.</p>
        <p className="text-sm mt-2">Configure trip days in the Parks step.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-dark mb-4">
        <CheckCircle2 size={20} className="text-brand-dark" />
        Trip Summary
      </h2>

      <div className="space-y-6">
        {tripDays.map((day) => {
          const parkName = getParkName(day.parkId);
          const hasAnyData =
            day.parkId ||
            day.arrival ||
            day.lodging ||
            (day.activities && day.activities.length > 0) ||
            day.logistics?.vehicle ||
            (day.logistics?.internalMovements && day.logistics.internalMovements.length > 0) ||
            day.logistics?.notes;

          if (!hasAnyData) {
            return null; // Skip empty days
          }

          return (
            <div
              key={day.dayNumber}
              className="border border-gray-300 rounded-lg p-4 md:p-6 bg-white"
            >
              {/* Day Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Calendar size={18} className="text-brand-dark" />
                <h3 className="font-semibold text-gray-800">Day {day.dayNumber}</h3>
                {day.parkId && (
                  <>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{parkName}</span>
                  </>
                )}
              </div>

              <div className="space-y-4">
                {/* Park */}
                {day.parkId && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Park
                      </div>
                      <div className="text-sm text-gray-800">{parkName}</div>
                    </div>
                  </div>
                )}

                {/* Arrival */}
                {day.arrival && (
                  <div className="flex items-start gap-3">
                    <Plane size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Arrival to Park
                      </div>
                      <div className="text-sm text-gray-800">{getItemName(day.arrival)}</div>
                    </div>
                  </div>
                )}

                {/* Lodging */}
                {day.lodging && (
                  <div className="flex items-start gap-3">
                    <Home size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Lodging
                      </div>
                      <div className="text-sm text-gray-800">{getItemName(day.lodging)}</div>
                    </div>
                  </div>
                )}

                {/* Activities */}
                {day.activities && day.activities.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Activity size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Activities
                      </div>
                      <ul className="space-y-1">
                        {day.activities.map((activityId) => (
                          <li key={activityId} className="text-sm text-gray-800">
                            • {getItemName(activityId)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Vehicle & Driver */}
                {day.logistics?.vehicle && (
                  <div className="flex items-start gap-3">
                    <Car size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                        Vehicle & Driver
                      </div>
                      <div className="text-sm text-gray-800">
                        {getItemName(day.logistics.vehicle)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Internal Movements */}
                {day.logistics?.internalMovements &&
                  day.logistics.internalMovements.length > 0 && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                          Internal Movements
                        </div>
                        <ul className="space-y-1">
                          {day.logistics.internalMovements.map((movementId) => (
                            <li key={movementId} className="text-sm text-gray-800">
                              • {getItemName(movementId)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                {/* Notes */}
                {day.logistics?.notes && (
                  <div className="flex items-start gap-3">
                    <FileText size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 uppercase mb-1">Notes</div>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap">
                        {day.logistics.notes}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle2 size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-900 mb-1">
              Trip Review Complete
            </div>
            <div className="text-xs text-blue-700">
              All trip details configured in the Parks step are displayed above. Review to ensure
              nothing is missing before proceeding to pricing.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



