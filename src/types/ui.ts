export type TripTier = 'base' | 'quality' | 'premium';

export type MarkupType = 'percent' | 'fixed';

export type PricingMode = 'PER_PERSON' | 'PER_UNIT';

export interface LineItemDraft {
  id: string;
  category: string;
  description: string;
  pricingMode: PricingMode;
  unitPrice: number;
  quantity: number; // Only used for PER_UNIT
  participants: number; // Passed from trip, NOT inferred
}

export interface Markup {
  type: MarkupType;
  value: number;
}

export interface DayDraft {
  dayNumber: number;
  title?: string;
  selections: {
    lodgingId?: string;
    vehicleEnabled?: boolean;
    domesticFlightRouteId?: string;
    parksIds: string[];
    activitiesIds: string[];
  };
}

export interface TripDraft {
  name: string;
  travelers: number;
  days: number;
  tier: TripTier; // Metadata only, not used in pricing
  markup?: Markup; // Optional, only in final step (post-calculation)
  daysBreakdown?: DayDraft[];
  manualLineItems?: LineItemDraft[]; // Manual pricing items
  parks?: ParkCard[]; // Park-based planning blocks (deprecated, use tripDays)
  tripDays?: TripDay[]; // Array of days (1 per trip day)
  // Pricing adjustments
  unexpectedPercentage?: number; // העמסת בלתי צפוי באחוזים
  localAgentVehiclePercentage?: number; // העמסת אחוז רכב לסוכן מקומי
  myProfitPercentage?: number; // העמאת רווח שלי באחוזים
}

export interface CalculationResult {
  calculationId: string;
  tripId: string;
  total: string;
  pricePerPerson: string;
  breakdown: CategoryBreakdown[];
  markup: MarkupDisplay;
  warnings: string[];
}

export interface CategoryBreakdown {
  category: string;
  items: LineItemDisplay[];
  subtotal: string;
}

export interface LineItemDisplay {
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
}

export interface MarkupDisplay {
  type: MarkupType;
  value: number;
  amount: string;
}

export interface ScenarioResults {
  base: CalculationResult | null;
  quality: CalculationResult | null;
  premium: CalculationResult | null;
}

export interface ParkLogistics {
  arrival?: string; // pricingItemId
  vehicle?: string; // pricingItemId
  internalMovements: string[]; // pricingItemIds
  notes?: string;
}

// TripDay represents one day in the trip (1, 2, 3... global trip day)
export interface TripDay {
  dayNumber: number; // 1, 2, 3... (global trip day)
  parkId?: string;
  arrival?: string; // pricingItemId
  lodging?: string; // pricingItemId
  activities: string[]; // pricingItemIds
  logistics?: {
    vehicle?: string; // pricingItemId
    internalMovements: string[]; // pricingItemIds
    notes?: string;
  };
}

// DayCard represents one calendar day within a park
export interface DayCard {
  id: string; // Unique ID for this day
  dayNumber: number; // 1, 2, 3... within this park (not global trip day)
  title?: string; // Optional: "Morning Safari", "Gorilla Trekking"
  activities: string[]; // pricingItemIds for this specific day
  extras: string[]; // pricingItemIds for this specific day
  departureToNextPark?: string; // Flight/movement to next park (only on last day of park)
  notes?: string; // Optional: itinerary notes for this day
}

export interface ParkCard {
  id: string;
  parkId?: string; // Park ID string (must match PARKS[].id)
  nights?: number; // Number of nights at this park/leg (auto-generates DayCards)
  
  // Park-level (applies to all days):
  arrival?: string; // pricingItemId - Arrival to THIS park (shown on first day)
  lodging?: string; // pricingItemId - Lodging for all nights at this park
  transport?: string; // pricingItemId - Default transport (can be overridden per day)
  
  days: DayCard[]; // Array of day cards (1 per night)
  
  // DEPRECATED: These will be moved to DayCards, but kept for backward compatibility during migration
  activities: string[]; // pricingItemIds - Will be distributed to DayCards
  extras: string[]; // pricingItemIds - Will be distributed to DayCards
  
  logistics?: ParkLogistics;
}

export type PricingModel =
  | 'per_person'
  | 'fixed'
  | 'per_day_fixed'
  | 'per_night_per_person'
  | 'per_night_fixed';

export type ManualCostType =
  | 'fixed_group'
  | 'fixed_per_day'
  | 'per_person'
  | 'per_person_per_day'
  | 'per_night'
  | 'per_night_per_person'
  | 'per_guide';

export type PricingCategory =
  | 'Aviation'
  | 'Lodging'
  | 'Vehicle'
  | 'Activities'
  | 'Park Fees'
  | 'Permits'
  | 'Extras'
  | 'Logistics';

export interface PricingItem {
  id: string;
  parkId?: string | null; // null or undefined = Global, MUST match park.id from Trip Builder
  category: PricingCategory;
  itemName: string;
  basePrice: number;
  costType: ManualCostType;
  appliesTo: 'Global' | 'Park'; // 'Global' = applies to all parks, 'Park' = park-specific
  active: boolean;
  notes?: string;
}

export interface ManualPricingLineItem {
  id: string;
  // Read-only
  park: string;
  category: string;
  itemName: string;
  // Editable
  basePrice: number | null; // null = not set yet
  costType: ManualCostType | '';
  showTotal: boolean;
  showPerPerson: boolean;
  optedOut: boolean;
  notes?: string;
}

export interface CatalogOption {
  id: string;
  name: string;
  price?: string; // Display price string (e.g., "USD 150")
  basePrice?: number; // Numeric price for calculations
  pricingModel?: PricingModel;
  splitAcrossTravelers?: boolean; // For fixed items that should show per-person
  capacity?: number; // Display only (e.g., helicopter 13 pax)
  tier?: TripTier;
  parkId?: string;
}

