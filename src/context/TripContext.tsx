import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { TripDraft, CalculationResult, DayDraft, ScenarioResults, ParkCard, DayCard, TripDay } from '../types/ui';
import { quoteService } from '../services/quoteService';

interface TripContextType {
  draft: TripDraft | null;
  draftQuoteId: string | null;
  sourceQuoteId: string | null;
  referenceNumber: number | null;
  calculationResult: CalculationResult | null;
  daysBreakdown: DayDraft[];
  scenarioResults: ScenarioResults;
  setDraft: (draft: TripDraft | null | ((prev: TripDraft | null) => TripDraft | null)) => void;
  setDraftQuoteId: (id: string | null) => void;
  setSourceQuoteId: (id: string | null) => void;
  setReferenceNumber: (referenceNumber: number | null) => void;
  setCalculationResult: (result: CalculationResult | null) => void;
  setDaysBreakdown: (days: DayDraft[]) => void;
  setScenarioResults: (results: ScenarioResults) => void;
  setTravelers: (travelers: number) => void;
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
const DRAFT_QUOTE_ID_STORAGE_KEY = 'da-draft-quote-id';
const SOURCE_QUOTE_ID_STORAGE_KEY = 'da-source-quote-id';
const REFERENCE_NUMBER_STORAGE_KEY = 'da-reference-number';

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Track localStorage quota failures
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const lastQuotaErrorRef = useRef<number>(0);
  const QUOTA_ERROR_COOLDOWN = 30000; // 30 seconds

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

  const [draftQuoteId, setDraftQuoteIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(DRAFT_QUOTE_ID_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [sourceQuoteId, setSourceQuoteIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SOURCE_QUOTE_ID_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const [referenceNumber, setReferenceNumberState] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(REFERENCE_NUMBER_STORAGE_KEY);
      if (!raw) return null;
      const parsed = Number(raw);
      return Number.isFinite(parsed) ? parsed : null;
    } catch {
      return null;
    }
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
        // Clear quota exceeded flag on successful write
        if (quotaExceeded) {
          setQuotaExceeded(false);
        }
      } catch (error) {
        // Check if it's a quota exceeded error
        const isQuotaError = error instanceof DOMException && 
          (error.name === 'QuotaExceededError' || error.code === 22);
        
        if (isQuotaError) {
          const now = Date.now();
          // Only show warning if cooldown period has passed
          if (now - lastQuotaErrorRef.current > QUOTA_ERROR_COOLDOWN) {
            lastQuotaErrorRef.current = now;
            setQuotaExceeded(true);
            alert(
              'Warning: Your trip data is too large to save locally. ' +
              'Please save your quote to the cloud or reduce the trip complexity. ' +
              'Your work may be lost if you close this page.'
            );
          }
        }
        // Continue without crashing
      }
    } else {
      try {
        localStorage.removeItem(TRIP_DRAFT_STORAGE_KEY);
      } catch {
        // Ignore errors on removal
      }
    }
  }, [draft, quotaExceeded]);

  useEffect(() => {
    try {
      if (draftQuoteId) {
        localStorage.setItem(DRAFT_QUOTE_ID_STORAGE_KEY, draftQuoteId);
      } else {
        localStorage.removeItem(DRAFT_QUOTE_ID_STORAGE_KEY);
      }
    } catch (error) {
      // Graceful failure - app continues to work
      console.error('Failed to save draftQuoteId to localStorage:', error);
    }
  }, [draftQuoteId]);

  useEffect(() => {
    try {
      if (sourceQuoteId) {
        localStorage.setItem(SOURCE_QUOTE_ID_STORAGE_KEY, sourceQuoteId);
      } else {
        localStorage.removeItem(SOURCE_QUOTE_ID_STORAGE_KEY);
      }
    } catch (error) {
      // Graceful failure - app continues to work
      console.error('Failed to save sourceQuoteId to localStorage:', error);
    }
  }, [sourceQuoteId]);

  useEffect(() => {
    try {
      if (typeof referenceNumber === 'number') {
        localStorage.setItem(REFERENCE_NUMBER_STORAGE_KEY, String(referenceNumber));
      } else {
        localStorage.removeItem(REFERENCE_NUMBER_STORAGE_KEY);
      }
    } catch (error) {
      // Graceful failure - app continues to work
      console.error('Failed to save referenceNumber to localStorage:', error);
    }
  }, [referenceNumber]);

  // If we don't have a local draft but we have a Firestore draftQuoteId, hydrate draft from Firestore
  useEffect(() => {
    let cancelled = false;
    if (draft) return;
    if (!draftQuoteId) return;

    quoteService
      .getQuote(draftQuoteId)
      .then((q) => {
        if (cancelled) return;
        if (q?.status === 'draft' && q?.draft) {
          setDraftState(q.draft);
        }
      })
      .catch(() => {
        // Ignore load errors
      });

    return () => {
      cancelled = true;
    };
  }, [draft, draftQuoteId, calculationResult]);

  // Firestore autosave (debounced)
  const autosaveTimerRef = useRef<number | null>(null);
  const autosaveInFlightRef = useRef(false);

  useEffect(() => {
    if (!draft) return;
    if (calculationResult) return;

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(async () => {
      if (autosaveInFlightRef.current) return;
      autosaveInFlightRef.current = true;
      try {
        if (!draftQuoteId) {
          const id = await quoteService.saveDraft(draft);
          setDraftQuoteIdState(id);
        } else {
          await quoteService.updateDraft(draftQuoteId, draft);
        }
      } catch {
        // Ignore autosave errors
      } finally {
        autosaveInFlightRef.current = false;
      }
    }, 800);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [draft, draftQuoteId, calculationResult]);

  // Wrapper to ensure state updates trigger localStorage save
  const setDraft = (newDraft: TripDraft | null | ((prev: TripDraft | null) => TripDraft | null)) => {
    if (typeof newDraft === 'function') {
      setDraftState(newDraft);
    } else {
      setDraftState(newDraft);
    }
  };

  const setDraftQuoteId = (id: string | null) => {
    setDraftQuoteIdState(id);
  };

  const setSourceQuoteId = (id: string | null) => {
    setSourceQuoteIdState(id);
  };

  const setReferenceNumber = (next: number | null) => {
    setReferenceNumberState(next);
  };

  const resetCalculatedState = () => {
    setCalculationResult(null);
    setScenarioResults({ base: null, quality: null, premium: null });
    setDaysBreakdown([]);
  };

  const setTravelers = (travelers: number) => {
    const safe = Math.max(1, Math.floor(travelers));
    setDraftState((prev) => {
      if (!prev) return prev;

      const prevTravelers = prev.travelers;
      const isDecrease = safe < prevTravelers;

      if (!isDecrease) {
        return {
          ...prev,
          travelers: safe,
        };
      }

      const sources: Record<string, 'auto' | 'manual'> = {
        ...(prev.itemQuantitySources || {}),
      };

      const nextItemQuantities: Record<string, number> = {
        ...(prev.itemQuantities || {}),
      };
      const nextSources: Record<string, 'auto' | 'manual'> = { ...sources };

      for (const [itemId, source] of Object.entries(sources)) {
        if (source === 'auto') {
          delete nextItemQuantities[itemId];
          delete nextSources[itemId];
        }
      }

      return {
        ...prev,
        travelers: safe,
        itemQuantities: nextItemQuantities,
        itemQuantitySources: nextSources,
      };
    });
    resetCalculatedState();
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

      // Initialize tripDays array if it doesn't exist (and NEVER mutate prev.tripDays)
      const existingTripDays = Array.isArray(prev.tripDays) ? prev.tripDays : [];

      // Deep-clone existing days to avoid any shared references between days
      const tripDays: TripDay[] = existingTripDays.map((day) => ({
        ...day,
        activities: Array.isArray(day.activities) ? [...day.activities] : [],
        parkFees: Array.isArray(day.parkFees)
          ? day.parkFees.map((f) => ({ ...f }))
          : [],
        logistics: day.logistics
          ? {
              ...day.logistics,
              internalMovements: Array.isArray(day.logistics.internalMovements)
                ? [...day.logistics.internalMovements]
                : [],
            }
          : undefined,
      }));

      // Ensure we have enough days (each day must be a fresh object)
      for (let i = tripDays.length; i < prev.days; i += 1) {
        tripDays.push({
          dayNumber: i + 1,
          activities: [],
          parkFees: [],
          logistics: {
            internalMovements: [],
          },
        });
      }

      // Update the specific day (deep-clone updates too)
      const normalizedUpdates: Partial<TripDay> = {
        ...updates,
      };

      if ('activities' in updates) {
        normalizedUpdates.activities = Array.isArray(updates.activities)
          ? [...updates.activities]
          : updates.activities;
      }

      if ('parkFees' in updates) {
        normalizedUpdates.parkFees = Array.isArray(updates.parkFees)
          ? updates.parkFees.map((f) => ({ ...f }))
          : updates.parkFees;
      }

      if ('logistics' in updates) {
        normalizedUpdates.logistics = updates.logistics
          ? {
              ...updates.logistics,
              internalMovements: Array.isArray(updates.logistics.internalMovements)
                ? [...updates.logistics.internalMovements]
                : [],
            }
          : updates.logistics;
      }

      const updatedTripDays = tripDays.map((day) => {
        if (day.dayNumber !== dayNumber) return day;

        // Correctly merge logistics
        const updatedLogistics =
          normalizedUpdates.logistics || day.logistics
            ? {
                ...(day.logistics || {}),
                ...(normalizedUpdates.logistics || {}),
                internalMovements:
                  normalizedUpdates.logistics?.internalMovements ||
                  day.logistics?.internalMovements ||
                  [],
              }
            : undefined;

        return {
          ...day,
          ...normalizedUpdates,
          logistics: updatedLogistics,
        };
      });

      return {
        ...prev,
        tripDays: updatedTripDays,
      };
    });
  };

  const clearDraft = () => {
    setDraft(null);
    setDraftQuoteId(null);
    setSourceQuoteId(null);
    setReferenceNumber(null);
    setDaysBreakdown([]);
    setScenarioResults({ base: null, quality: null, premium: null });
    localStorage.removeItem(TRIP_DRAFT_STORAGE_KEY);
    localStorage.removeItem(DRAFT_QUOTE_ID_STORAGE_KEY);
    localStorage.removeItem(SOURCE_QUOTE_ID_STORAGE_KEY);
    localStorage.removeItem(REFERENCE_NUMBER_STORAGE_KEY);
  };

  return (
    <TripContext.Provider
      value={{
        draft,
        draftQuoteId,
        sourceQuoteId,
        referenceNumber,
        calculationResult,
        daysBreakdown,
        scenarioResults,
        setDraft,
        setDraftQuoteId,
        setSourceQuoteId,
        setReferenceNumber,
        setCalculationResult,
        setDaysBreakdown,
        setScenarioResults,
        setTravelers,
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

