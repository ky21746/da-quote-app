import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TripDraft, CalculationResult, DayDraft, ScenarioResults, ParkCard, DayCard } from '../types/ui';

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
          if (!card.days && card.nights && card.nights > 0) {
            // Migrate old ParkCard: distribute activities/extras to first day
            currentDays = generateDayCards(card.nights);
            if (card.activities.length > 0 || card.extras.length > 0) {
              currentDays[0] = {
                ...currentDays[0],
                activities: [...card.activities],
                extras: [...card.extras],
              };
            }
          }
          
          // If nights changed, update DayCards array
          const newNights = updates.nights !== undefined ? updates.nights : card.nights;
          const currentNights = currentDays.length;
          
          let updatedDays = [...currentDays];
          
          // Auto-generate DayCards when nights is set/changed
          if (newNights !== undefined && newNights !== currentNights) {
            if (newNights > currentNights) {
              // Add new DayCards
              const newDays = generateDayCards(newNights - currentNights);
              updatedDays = [...updatedDays, ...newDays.map((day, idx) => ({
                ...day,
                dayNumber: currentNights + idx + 1,
              }))];
            } else if (newNights < currentNights) {
              // Remove excess DayCards (keep first N days)
              updatedDays = updatedDays.slice(0, newNights);
              // Clear departureToNextPark from the new last day if it exists
              if (updatedDays.length > 0 && updatedDays[updatedDays.length - 1].departureToNextPark) {
                updatedDays[updatedDays.length - 1] = {
                  ...updatedDays[updatedDays.length - 1],
                  departureToNextPark: undefined,
                };
              }
            }
          }
          
          // If nights is set for the first time, generate initial DayCards
          if (newNights !== undefined && updatedDays.length === 0 && newNights > 0) {
            updatedDays = generateDayCards(newNights);
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

