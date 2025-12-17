import React, { createContext, useContext, useState, ReactNode } from 'react';
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

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [draft, setDraft] = useState<TripDraft | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [daysBreakdown, setDaysBreakdown] = useState<DayDraft[]>([]);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResults>({
    base: null,
    quality: null,
    premium: null,
  });

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
    setDraft((prev) => ({
      ...prev!,
      parks: [...(prev?.parks || []), newCard],
    }));
  };

  const updateParkCard = (cardId: string, updates: Partial<ParkCard>) => {
    setDraft((prev) => {
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
    setDraft((prev) => {
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

