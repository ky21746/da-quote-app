import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TripDraft, CalculationResult, DayDraft, ScenarioResults, ParkCard } from '../types/ui';

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
        parks: (prev.parks || []).map((card) =>
          card.id === cardId ? { ...card, ...updates } : card
        ),
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

