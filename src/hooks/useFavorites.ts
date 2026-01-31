/**
 * useFavorites Hook
 * Manages user favorites stored in Firestore
 */

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { UserFavorites, ParkFavorites } from '../types/favorites';

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<UserFavorites | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites from Firestore
  useEffect(() => {
    if (!user) {
      setFavorites(null);
      setIsLoading(false);
      return;
    }

    const loadFavorites = async () => {
      try {
        const docRef = doc(db, 'userFavorites', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFavorites({
            userId: user.uid,
            byPark: data.byPark || {},
            global: data.global || {},
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          // Initialize empty favorites
          const emptyFavorites: UserFavorites = {
            userId: user.uid,
            byPark: {},
            updatedAt: new Date(),
          };
          setFavorites(emptyFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  // Save favorites to Firestore
  const saveFavorites = useCallback(async (updatedFavorites: UserFavorites) => {
    if (!user) return;

    try {
      const docRef = doc(db, 'userFavorites', user.uid);
      await setDoc(docRef, {
        byPark: updatedFavorites.byPark,
        global: updatedFavorites.global || {},
        updatedAt: new Date(),
      });
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw error;
    }
  }, [user]);

  // Toggle lodging favorite (only one per park)
  const toggleLodgingFavorite = useCallback(async (parkId: string, itemId: string) => {
    if (!favorites || !user) return;

    const currentLodging = favorites.byPark[parkId]?.lodging;
    const newByPark = { ...favorites.byPark };

    if (currentLodging === itemId) {
      // Remove favorite
      if (newByPark[parkId]) {
        delete newByPark[parkId].lodging;
        if (Object.keys(newByPark[parkId]).length === 1 && newByPark[parkId].parkId) {
          delete newByPark[parkId];
        }
      }
    } else {
      // Set new favorite
      newByPark[parkId] = {
        ...newByPark[parkId],
        parkId,
        lodging: itemId,
      };
    }

    const updated: UserFavorites = {
      ...favorites,
      byPark: newByPark,
      updatedAt: new Date(),
    };

    await saveFavorites(updated);
  }, [favorites, user, saveFavorites]);

  // Toggle activity favorite (multiple per park)
  const toggleActivityFavorite = useCallback(async (parkId: string, itemId: string) => {
    if (!favorites || !user) return;

    const currentActivities = favorites.byPark[parkId]?.activities || [];
    const newByPark = { ...favorites.byPark };

    if (currentActivities.includes(itemId)) {
      // Remove from favorites
      const filtered = currentActivities.filter(id => id !== itemId);
      if (filtered.length === 0) {
        if (newByPark[parkId]) {
          delete newByPark[parkId].activities;
          if (Object.keys(newByPark[parkId]).length === 1 && newByPark[parkId].parkId) {
            delete newByPark[parkId];
          }
        }
      } else {
        newByPark[parkId] = {
          ...newByPark[parkId],
          parkId,
          activities: filtered,
        };
      }
    } else {
      // Add to favorites
      newByPark[parkId] = {
        ...newByPark[parkId],
        parkId,
        activities: [...currentActivities, itemId],
      };
    }

    const updated: UserFavorites = {
      ...favorites,
      byPark: newByPark,
      updatedAt: new Date(),
    };

    await saveFavorites(updated);
  }, [favorites, user, saveFavorites]);

  // Toggle arrival favorite
  const toggleArrivalFavorite = useCallback(async (parkId: string, itemId: string) => {
    if (!favorites || !user) return;

    const currentArrival = favorites.byPark[parkId]?.arrival;
    const newByPark = { ...favorites.byPark };

    if (currentArrival === itemId) {
      // Remove favorite
      if (newByPark[parkId]) {
        delete newByPark[parkId].arrival;
        if (Object.keys(newByPark[parkId]).length === 1 && newByPark[parkId].parkId) {
          delete newByPark[parkId];
        }
      }
    } else {
      // Set new favorite
      newByPark[parkId] = {
        ...newByPark[parkId],
        parkId,
        arrival: itemId,
      };
    }

    const updated: UserFavorites = {
      ...favorites,
      byPark: newByPark,
      updatedAt: new Date(),
    };

    await saveFavorites(updated);
  }, [favorites, user, saveFavorites]);

  // Check if lodging is favorited
  const isLodgingFavorite = useCallback((parkId: string, itemId: string): boolean => {
    return favorites?.byPark[parkId]?.lodging === itemId;
  }, [favorites]);

  // Check if activity is favorited
  const isActivityFavorite = useCallback((parkId: string, itemId: string): boolean => {
    return favorites?.byPark[parkId]?.activities?.includes(itemId) || false;
  }, [favorites]);

  // Check if arrival is favorited
  const isArrivalFavorite = useCallback((parkId: string, itemId: string): boolean => {
    return favorites?.byPark[parkId]?.arrival === itemId;
  }, [favorites]);

  // Get all favorites for a park
  const getParkFavorites = useCallback((parkId: string): ParkFavorites | null => {
    return favorites?.byPark[parkId] || null;
  }, [favorites]);

  return {
    favorites,
    isLoading,
    toggleLodgingFavorite,
    toggleActivityFavorite,
    toggleArrivalFavorite,
    isLodgingFavorite,
    isActivityFavorite,
    isArrivalFavorite,
    getParkFavorites,
  };
}
