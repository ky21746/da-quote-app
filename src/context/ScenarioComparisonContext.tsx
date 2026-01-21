import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TripDraft } from '../types/ui';

export interface Scenario {
  scenarioId: string;
  scenarioName: string;
  draft: TripDraft;
  isBase: boolean;
}

interface ScenarioComparisonContextType {
  scenarios: Scenario[];
  addScenario: (scenario: Scenario) => void;
  updateScenario: (scenarioId: string, draft: TripDraft) => void;
  removeScenario: (scenarioId: string) => void;
  clearScenarios: () => void;
  getScenarioById: (scenarioId: string) => Scenario | undefined;
  setCurrentTripId: (tripId: string | undefined) => void;
}

const ScenarioComparisonContext = createContext<ScenarioComparisonContextType | undefined>(
  undefined
);

export const useScenarioComparisonContext = () => {
  const context = useContext(ScenarioComparisonContext);
  if (!context) {
    throw new Error(
      'useScenarioComparisonContext must be used within ScenarioComparisonProvider'
    );
  }
  return context;
};

interface ScenarioComparisonProviderProps {
  children: React.ReactNode;
}

interface ScenarioStoragePayload {
  version: 1;
  updatedAt: number;
  scenarios: Scenario[];
}

const STORAGE_VERSION = 1;
const STORAGE_KEY_PREFIX = 'da_scenarios_';
const STORAGE_KEY_SESSION = 'da_scenarios_session';

function getStorageKey(tripId?: string): string {
  return tripId ? `${STORAGE_KEY_PREFIX}${tripId}` : STORAGE_KEY_SESSION;
}

function loadScenariosFromStorage(tripId?: string): Scenario[] {
  try {
    const key = getStorageKey(tripId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    const payload: ScenarioStoragePayload = JSON.parse(stored);
    if (payload.version !== STORAGE_VERSION) {
      console.warn('Scenario storage version mismatch, clearing');
      localStorage.removeItem(key);
      return [];
    }

    return payload.scenarios || [];
  } catch (error) {
    console.error('Failed to load scenarios from localStorage:', error);
    return [];
  }
}

function saveScenariosToStorage(scenarios: Scenario[], tripId?: string): void {
  try {
    const key = getStorageKey(tripId);
    const payload: ScenarioStoragePayload = {
      version: STORAGE_VERSION,
      updatedAt: Date.now(),
      scenarios,
    };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (error) {
    console.error('Failed to save scenarios to localStorage:', error);
    // Graceful failure - app continues to work
  }
}

export const ScenarioComparisonProvider: React.FC<ScenarioComparisonProviderProps> = ({
  children,
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [tripId, setTripId] = useState<string | undefined>(undefined);

  // Load scenarios from localStorage on mount
  useEffect(() => {
    const loaded = loadScenariosFromStorage(tripId);
    if (loaded.length > 0) {
      setScenarios(loaded);
    }
  }, [tripId]);

  // Save scenarios to localStorage whenever they change
  useEffect(() => {
    if (scenarios.length > 0) {
      saveScenariosToStorage(scenarios, tripId);
    }
  }, [scenarios, tripId]);

  const addScenario = useCallback((scenario: Scenario) => {
    setScenarios((prev) => [...prev, scenario]);
  }, []);

  const updateScenario = useCallback((scenarioId: string, draft: TripDraft) => {
    setScenarios((prev) =>
      prev.map((s) => (s.scenarioId === scenarioId ? { ...s, draft } : s))
    );
  }, []);

  const removeScenario = useCallback((scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.scenarioId !== scenarioId));
  }, []);

  const clearScenarios = useCallback(() => {
    setScenarios([]);
    try {
      const key = getStorageKey(tripId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear scenarios from localStorage:', error);
    }
  }, [tripId]);

  const setCurrentTripId = useCallback((newTripId: string | undefined) => {
    setTripId(newTripId);
  }, []);

  const getScenarioById = useCallback(
    (scenarioId: string) => {
      return scenarios.find((s) => s.scenarioId === scenarioId);
    },
    [scenarios]
  );

  const value: ScenarioComparisonContextType = {
    scenarios,
    addScenario,
    updateScenario,
    removeScenario,
    clearScenarios,
    getScenarioById,
    setCurrentTripId,
  };

  return (
    <ScenarioComparisonContext.Provider value={value}>
      {children}
    </ScenarioComparisonContext.Provider>
  );
};
