import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { Button } from '../common';
import { TripDayCard } from './TripDayCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ParksSection: React.FC = () => {
  const { draft, updateTripDay } = useTrip();

  const totalDays = draft?.days || 0;
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  // Reset currentDayIndex if it goes out of bounds
  useEffect(() => {
    if (totalDays > 0 && currentDayIndex >= totalDays) {
      setCurrentDayIndex(Math.max(0, totalDays - 1));
    }
  }, [totalDays, currentDayIndex]);

  const currentDayNumber = currentDayIndex + 1;
  const currentDayData: {
    parkId?: string;
    arrival?: string;
    lodging?: string;
    activities: string[];
    logistics?: {
      vehicle?: string;
      internalMovements: string[];
      notes?: string;
    };
  } = draft?.tripDays?.[currentDayIndex] || {
    activities: [],
    logistics: {
      internalMovements: [],
    },
  };

  const handlePrevious = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentDayIndex < totalDays - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
    }
  };

  const handleUpdateDay = (updates: {
    parkId?: string;
    arrival?: string;
    lodging?: string;
    activities?: string[];
    logistics?: {
      vehicle?: string;
      internalMovements?: string[];
      notes?: string;
    };
  }) => {
    // Ensure logistics.internalMovements is always an array
    const normalizedUpdates: Partial<import('../../types/ui').TripDay> = {
      ...updates,
      logistics: updates.logistics
        ? {
            ...updates.logistics,
            internalMovements: updates.logistics.internalMovements || [],
          }
        : undefined,
    };
    updateTripDay(currentDayNumber, normalizedUpdates);
  };

  if (totalDays === 0) {
    return (
      <div className="p-4 md:p-6 border border-gray-200 rounded-lg text-center text-gray-500">
        Please set the number of days in the trip setup.
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-brand-dark">Trip Days</h2>
        <div className="text-sm text-gray-600">
          Day {currentDayNumber} of {totalDays}
        </div>
      </div>

      {/* Timeline/Stepper */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentDayIndex === 0}
          className="h-12 w-12 flex items-center justify-center rounded-full border-2 border-brand-olive text-brand-dark hover:bg-brand-olive/10 disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors box-border"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-4 overflow-x-auto items-center">
          {Array.from({ length: totalDays }, (_, i) => {
            const dayData = draft?.tripDays?.[i];
            const hasPark = dayData?.parkId !== undefined;
            
            return (
              <button
                key={i}
                onClick={() => setCurrentDayIndex(i)}
                className={`w-12 h-12 rounded-full font-semibold text-sm transition-colors flex items-center justify-center box-border ${
                  i === currentDayIndex
                    ? 'bg-brand-olive text-white border-2 border-brand-olive'
                    : hasPark
                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300 border-2 border-transparent'
                }`}
              >
                D{i + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNext}
          disabled={currentDayIndex >= totalDays - 1}
          className="h-12 w-12 flex items-center justify-center rounded-full border-2 border-brand-olive text-brand-dark hover:bg-brand-olive/10 disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors box-border"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Current Day Card */}
      <TripDayCard
        dayNumber={currentDayNumber}
        parkId={currentDayData.parkId}
        arrival={currentDayData.arrival}
        lodging={currentDayData.lodging}
        activities={currentDayData.activities || []}
        logistics={currentDayData.logistics}
        onUpdate={handleUpdateDay}
      />
    </div>
  );
};
