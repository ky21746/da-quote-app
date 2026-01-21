import React, { createContext, useContext, useState, useCallback } from 'react';
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

export const ScenarioComparisonProvider: React.FC<ScenarioComparisonProviderProps> = ({
  children,
}) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

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
  };

  return (
    <ScenarioComparisonContext.Provider value={value}>
      {children}
    </ScenarioComparisonContext.Provider>
  );
};
