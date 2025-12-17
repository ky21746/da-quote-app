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

export interface ParkCard {
  id: string;
  parkId?: string;
  arrival?: string;
  lodging?: string;
  transport?: string;
  activities: string[];
  extras: string[];
}

export interface CatalogOption {
  id: string;
  name: string;
  price?: string;
  tier?: TripTier;
  parkId?: string;
}

