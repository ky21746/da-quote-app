import { useState } from 'react';
import { tripRepository } from '../app/config/dependencies';
import { authService } from '../app/auth';
import { Trip } from '../core/domain/entities';
import { TripStatus } from '../core/domain/enums';
import { DayType } from '../core/domain/enums';
import { DateRange } from '../core/domain/valueObjects';
import { TripDraft } from '../types/ui';

export const useTripCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = async (draft: TripDraft): Promise<string | null> => {
    setIsCreating(true);
    setError(null);

    try {
      const userId = authService.getUserId();

      // Create date range (start from today, end after N days)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + draft.days - 1);
      const dateRange = new DateRange(startDate, endDate);

      // Create minimal days array (one day per day)
      const days = Array.from({ length: draft.days }, (_, i) => {
        const dayDate = new Date(startDate);
        dayDate.setDate(startDate.getDate() + i);
        return {
          id: `day_${i + 1}`,
          date: dayDate,
          type: DayType.ACTIVITY,
          location: 'Uganda',
          activities: [],
        };
      });

      const trip: Trip = {
        id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        status: TripStatus.DRAFT,
        destination: draft.name,
        dateRange,
        travelers: draft.travelers,
        days,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          tier: draft.tier,
          ...(draft.markup && { markup: draft.markup }),
          daysBreakdown: draft.daysBreakdown || [],
        },
      };

      const savedTrip = await tripRepository.save(trip);
      return savedTrip.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create trip';
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createTrip,
    isCreating,
    error,
  };
};

