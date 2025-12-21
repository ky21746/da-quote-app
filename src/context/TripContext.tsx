import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TripDraft, CalculationResult, DayDraft, ScenarioResults, ParkCard, DayCard, TripDay } from '../types/ui';

interface TripContextType {
  draft: TripDraft | null;
  calculationResult: CalculationResult | null;
  daysBreakdown: DayDraft[];
  scenarioResults: ScenarioResults;
  setDraft: (draft: TripDraft) => void;
  setCalculationResult: (result: CalculationResult | null) => void;
  setDaysBreakdown: (days: DayDraft[]) => void;
  setScenarioResults: (results: ScenarioResults) => void;
  updateDay: (dayNumber: number, updates: Partial<DayDraft>) => void;
  addParkCard: () => void;
  updateParkCard: (cardId: string, updates: Partial<ParkCard>) => void;
  removeParkCard: (cardId: string) => void;
  updateDayCard: (parkCardId: string, dayCardId: string, updates: Partial<DayCard>) => void;
  updateTripDay: (dayNumber: number, updates: Partial<TripDay>) => void;
  clearDraft: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

// Storage key for trip draft persistence
const TRIP_DRAFT_STORAGE_KEY = 'da-trip-draft';

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load draft from localStorage on mount
  const [draft, setDraftState] = useState<TripDraft | null>(() => {
    try {
      const stored = localStorage.getItem(TRIP_DRAFT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [daysBreakdown, setDaysBreakdown] = useState<DayDraft[]>([]);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResults>({
    base: null,
    quality: null,
    premium: null,
  });

  // Save draft to localStorage on every change
  useEffect(() => {
    if (draft) {
      try {
        localStorage.setItem(TRIP_DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch {
        // Ignore storage errors
      }
    } else {
      localStorage.removeItem(TRIP_DRAFT_STORAGE_KEY);
    }
  }, [draft]);

  // Wrapper to ensure state updates trigger localStorage save
  const setDraft = (newDraft: TripDraft | null | ((prev: TripDraft | null) => TripDraft | null)) => {
    if (typeof newDraft === 'function') {
      setDraftState(newDraft);
    } else {
      setDraftState(newDraft);
    }
  };

  // Helper function to generate DayCards based on nights
  const generateDayCards = (nights: number): DayCard[] => {
    const days: DayCard[] = [];
    for (let i = 1; i <= nights; i++) {
      days.push({
        id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        dayNumber: i,
        activities: [],
        extras: [],
      });
    }
    return days;
  };

  const updateDay = (dayNumber: number, updates: Partial<DayDraft>) => {
    setDaysBreakdown((prev) =>
      prev.map((day) => (day.dayNumber === dayNumber ? { ...day, ...updates } : day))
    );
  };

  const addParkCard = () => {
    const newCard: ParkCard = {
      id: `park_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activities: [],
      extras: [],
      days: [], // Start with empty days array
      logistics: {
        internalMovements: [],
      },
    };
    setDraftState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        parks: [...(prev.parks || []), newCard],
      };
    });
  };

  const updateParkCard = (cardId: string, updates: Partial<ParkCard>) => {
    setDraftState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        parks: (prev.parks || []).map((card) => {
          if (card.id !== cardId) return card;
          
          // Backward compatibility: If card doesn't have days array, initialize it
          let currentDays = card.days || [];
          const newNights = updates.nights !== undefined ? updates.nights : card.nights;
          
          // Calculate number of days for this park: days = nights + 1 (last day is departure without lodging)
          // If trip has 5 days total and this park has 4 nights, create 5 DayCards for this park
          // For a single park covering entire trip, use trip days; otherwise use nights + 1
          const totalParks = (prev.parks || []).length;
          const tripDays = prev.days || 0;
          const parkDays = (totalParks === 1 && tripDays > 0) ? tripDays : (newNights ? newNights + 1 : 1);
          
          if (!card.days && newNights && newNights > 0) {
            // Migrate old ParkCard: distribute activities/extras to first day
            // Create DayCards based on park days (nights + 1 for last day without lodging)
            currentDays = Array.from({ length: parkDays }, (_, i) => ({
              id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
              dayNumber: i + 1,
              activities: [],
              extras: [],
            }));
            if (card.activities.length > 0 || card.extras.length > 0) {
              currentDays[0] = {
                ...currentDays[0],
                activities: [...card.activities],
                extras: [...card.extras],
              };
            }
          }
          
          let updatedDays = [...currentDays];
          
          // Auto-generate DayCards based on park days (nights + 1) when nights is set/changed
          if (newNights !== undefined && parkDays !== currentDays.length) {
            // Create DayCards for all park days (nights + 1, where last day is without lodging)
            updatedDays = Array.from({ length: parkDays }, (_, i) => {
              // Reuse existing day if available
              if (currentDays[i]) {
                return {
                  ...currentDays[i],
                  dayNumber: i + 1,
                };
              }
              // Create new day
              return {
                id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
                dayNumber: i + 1,
                activities: [],
                extras: [],
              };
            });
            
            // Clear departureToNextPark from the new last day if it exists
            if (updatedDays.length > 0 && updatedDays[updatedDays.length - 1].departureToNextPark) {
              updatedDays[updatedDays.length - 1] = {
                ...updatedDays[updatedDays.length - 1],
                departureToNextPark: undefined,
              };
            }
          }
          
          // If nights is set for the first time, generate initial DayCards based on park days
          if (newNights !== undefined && updatedDays.length === 0 && newNights > 0) {
            updatedDays = Array.from({ length: parkDays }, (_, i) => ({
              id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
              dayNumber: i + 1,
              activities: [],
              extras: [],
            }));
          }
          
          return {
            ...card,
            ...updates,
            days: updatedDays,
          };
        }),
      };
    });
  };

  const updateDayCard = (parkCardId: string, dayCardId: string, updates: Partial<DayCard>) => {
    setDraftState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        parks: (prev.parks || []).map((card) => {
          if (card.id !== parkCardId) return card;
          return {
            ...card,
            days: (card.days || []).map((day) =>
              day.id === dayCardId ? { ...day, ...updates } : day
            ),
          };
        }),
      };
    });
  };

  const removeParkCard = (cardId: string) => {
    setDraftState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        parks: (prev.parks || []).filter((card) => card.id !== cardId),
      };
    });
  };

  const updateTripDay = (dayNumber: number, updates: Partial<TripDay>) => {
    setDraftState((prev) => {
      if (!prev) return prev;
      
      // Initialize tripDays array if it doesn't exist
      let tripDays = prev.tripDays || [];
      
      // Ensure we have enough days
      while (tripDays.length < prev.days) {
        tripDays.push({
          dayNumber: tripDays.length + 1,
          activities: [],
          logistics: {
            internalMovements: [],
          },
        });
      }
      
      // Update the specific day
      tripDays = tripDays.map((day) =>
        day.dayNumber === dayNumber
          ? { ...day, ...updates }
          : day
      );
      
      return {
        ...prev,
        tripDays,
      };
    });
  };

  const clearDraft = () => {
    setDraft(null);
    setDaysBreakdown([]);
    setScenarioResults({ base: null, quality: null, premium: null });
    localStorage.removeItem(TRIP_DRAFT_STORAGE_KEY);
  };

  return (
    <TripContext.Provider
      value={{
        draft,
        calculationResult,
        daysBreakdown,
        scenarioResults,
        setDraft,
        setCalculationResult,
        setDaysBreakdown,
        setScenarioResults,
        updateDay,
        addParkCard,
        updateParkCard,
        removeParkCard,
        updateDayCard,
        updateTripDay,
        clearDraft,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = (): TripContextType => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within TripProvider');
  }
  return context;
};

