import { useCallback } from 'react';
import { TripDraft } from '../types/ui';
import { Scenario, useScenarioComparisonContext } from '../context/ScenarioComparisonContext';

/**
 * Deep clone a TripDraft object to ensure complete isolation between scenarios
 */
function deepCloneTripDraft(draft: TripDraft): TripDraft {
  return JSON.parse(JSON.stringify(draft));
}

/**
 * Generate a unique scenario ID
 */
function generateScenarioId(): string {
  return `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useScenarioDuplication() {
  const { scenarios, addScenario, updateScenario, removeScenario, clearScenarios } =
    useScenarioComparisonContext();

  /**
   * Duplicate a scenario from the current draft
   */
  const duplicateScenario = useCallback(
    (baseDraft: TripDraft, scenarioName?: string) => {
      const clonedDraft = deepCloneTripDraft(baseDraft);
      const scenarioId = generateScenarioId();
      
      const newScenario: Scenario = {
        scenarioId,
        scenarioName: scenarioName || `Scenario ${scenarios.length + 1}`,
        draft: clonedDraft,
        isBase: scenarios.length === 0, // First scenario is the base
      };

      addScenario(newScenario);
      return newScenario;
    },
    [scenarios.length, addScenario]
  );

  /**
   * Create base scenario from current draft
   */
  const createBaseScenario = useCallback(
    (baseDraft: TripDraft) => {
      if (scenarios.length > 0) {
        return scenarios[0]; // Base already exists
      }

      const clonedDraft = deepCloneTripDraft(baseDraft);
      const scenarioId = generateScenarioId();
      
      const baseScenario: Scenario = {
        scenarioId,
        scenarioName: 'Base Scenario',
        draft: clonedDraft,
        isBase: true,
      };

      addScenario(baseScenario);
      return baseScenario;
    },
    [scenarios, addScenario]
  );

  return {
    scenarios,
    duplicateScenario,
    createBaseScenario,
    updateScenario,
    removeScenario,
    clearScenarios,
  };
}
