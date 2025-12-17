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
  parks?: ParkCard[]; // Park-based planning blocks
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
  arrival?: string;
  vehicle?: string;
  internalMovements: string[];
  notes?: string;
}

export interface ParkCard {
  id: string;
  parkId?: string;
  arrival?: string;
  lodging?: string;
  transport?: string;
  activities: string[];
  extras: string[];
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
  | 'per_night_per_person'
  | 'per_night_fixed';

export type PricingCategory =
  | 'Aviation'
  | 'Lodging'
  | 'Vehicle'
  | 'Activities'
  | 'Park Fees'
  | 'Extras';

export interface PricingItem {
  id: string;
  parkId?: string; // undefined = Global
  category: PricingCategory;
  itemName: string;
  basePrice: number;
  costType: ManualCostType;
  appliesTo: 'Park-specific' | 'Global';
  notes?: string;
  active: boolean;
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

