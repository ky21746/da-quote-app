/**
 * Favorites system types
 * Allows users to mark preferred lodging, activities, etc. for auto-population in future quotes
 */

export interface UserFavorites {
  userId: string;
  
  // Favorites organized by park
  byPark: {
    [parkId: string]: ParkFavorites;
  };
  
  // Global favorites (not park-specific)
  global?: {
    activities?: string[]; // pricingItemIds
    extras?: string[];
  };
  
  updatedAt: Date;
}

export interface ParkFavorites {
  parkId: string;
  
  // Single lodging favorite per park
  lodging?: string; // pricingItemId
  
  // Multiple activity favorites
  activities?: string[]; // pricingItemIds
  
  // Transport preferences
  arrival?: string; // pricingItemId
  
  // Extras
  extras?: string[]; // pricingItemIds
}

export interface FavoritesContextValue {
  favorites: UserFavorites | null;
  isLoading: boolean;
  
  // Add/remove favorites
  toggleLodgingFavorite: (parkId: string, itemId: string) => Promise<void>;
  toggleActivityFavorite: (parkId: string, itemId: string) => Promise<void>;
  toggleArrivalFavorite: (parkId: string, itemId: string) => Promise<void>;
  
  // Check if item is favorited
  isLodgingFavorite: (parkId: string, itemId: string) => boolean;
  isActivityFavorite: (parkId: string, itemId: string) => boolean;
  isArrivalFavorite: (parkId: string, itemId: string) => boolean;
  
  // Get favorites for a park
  getParkFavorites: (parkId: string) => ParkFavorites | null;
}
