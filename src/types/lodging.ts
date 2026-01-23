/**
 * Enhanced Lodging Data Structure
 * 
 * Comprehensive hotel/lodge information including regulations,
 * room configurations, age policies, and pricing rules.
 */

export interface LodgingRegulations {
  // Age Policies
  childAgeRange?: {
    min: number; // Minimum age considered as child
    max: number; // Maximum age considered as child
  };
  infantAgeRange?: {
    min: number;
    max: number;
  };
  minimumAge?: number; // Minimum age to stay (e.g., some lodges don't accept young children)
  
  // Room Configuration
  maxOccupancyPerRoom: number; // Maximum people per room
  maxAdultsPerRoom: number; // Maximum adults per room
  maxChildrenPerRoom: number; // Maximum children per room
  infantsCountAsOccupancy: boolean; // Do infants count toward occupancy limit?
  
  // Room Types Available
  roomTypes: {
    type: 'single' | 'double' | 'twin' | 'triple' | 'family' | 'suite' | 'villa';
    maxOccupancy: number;
    maxAdults: number;
    maxChildren: number;
    allowInfants: boolean;
    extraBedAvailable: boolean;
    description?: string;
  }[];
  
  // Pricing Rules
  childDiscount?: {
    ageRange: { min: number; max: number };
    discountPercent: number; // e.g., 50 for 50% off
    conditions?: string; // e.g., "when sharing with 2 adults"
  }[];
  infantPolicy?: {
    freeUpToAge: number; // e.g., infants under 3 are free
    conditions?: string;
  };
  
  // Seasonal Restrictions
  seasonalRules?: {
    season: 'low' | 'high' | 'peak';
    minimumNights?: number;
    maximumNights?: number;
    advanceBookingRequired?: number; // days
  }[];
  
  // Special Requirements
  specialRequirements?: string[]; // e.g., "Malaria prophylaxis recommended", "Yellow fever certificate required"
  
  // Accessibility
  wheelchairAccessible?: boolean;
  familyFriendly?: boolean;
  adultsOnly?: boolean;
}

export interface LodgingAmenities {
  wifi: boolean;
  pool: boolean;
  spa: boolean;
  restaurant: boolean;
  bar: boolean;
  laundry: boolean;
  airConditioning: boolean;
  heating: boolean;
  generator: boolean; // Important in remote areas
  safetyBox: boolean;
  mosquitoNets: boolean;
  privateBalcony: boolean;
  viewType?: 'park' | 'lake' | 'mountain' | 'garden' | 'forest';
}

export interface LodgingLocation {
  parkId: string;
  parkName: string;
  region: string; // e.g., "Southwestern Uganda", "Western Uganda"
  coordinates?: {
    lat: number;
    lng: number;
  };
  nearestAirstrip?: string;
  distanceFromParkGate?: number; // kilometers
  insidePark: boolean; // Is the lodge inside the park boundaries?
}

export interface EnhancedLodging {
  // Basic Info
  id: string;
  sku: string;
  name: string;
  tier: 'budget' | 'standard' | 'luxury' | 'ultra-luxury';
  
  // Location
  location: LodgingLocation;
  
  // Pricing
  basePrice: number; // Base price per night
  currency: 'USD' | 'UGX';
  pricingModel: 'per_night_per_person' | 'per_night_per_room' | 'per_villa';
  
  // Seasonal Pricing (optional - can override basePrice)
  seasonalPricing?: {
    low?: number;
    high?: number;
    peak?: number;
  };
  
  // Regulations & Rules
  regulations: LodgingRegulations;
  
  // Amenities
  amenities: LodgingAmenities;
  
  // Additional Info
  description?: string;
  highlights?: string[]; // e.g., "Best gorilla trekking location", "Stunning lake views"
  activities?: string[]; // Activities available at the lodge
  
  // Booking Info
  bookingLeadTime?: number; // Minimum days in advance to book
  cancellationPolicy?: string;
  
  // Status
  active: boolean;
  featured?: boolean; // Featured/recommended lodge
}

/**
 * Helper function to validate if a traveler group can stay at a lodge
 */
export interface TravelerGroup {
  adults: number;
  children: number;
  infants: number;
  ages: number[];
}

export interface LodgingValidationResult {
  canStay: boolean;
  roomsNeeded: number;
  warnings: string[];
  suggestions: string[];
  estimatedCost?: number;
}

/**
 * Example enhanced lodging data structure
 */
export const EXAMPLE_ENHANCED_LODGING: EnhancedLodging = {
  id: 'lodg_bwindi_clouds',
  sku: 'ACC-BWI-CML',
  name: 'Clouds Mountain Gorilla Lodge',
  tier: 'luxury',
  
  location: {
    parkId: 'park_1',
    parkName: 'Bwindi Impenetrable National Park',
    region: 'Southwestern Uganda',
    coordinates: { lat: -1.0667, lng: 29.6833 },
    nearestAirstrip: 'Kihihi Airstrip',
    distanceFromParkGate: 5,
    insidePark: false,
  },
  
  basePrice: 600,
  currency: 'USD',
  pricingModel: 'per_night_per_person',
  
  seasonalPricing: {
    low: 500,
    high: 600,
    peak: 700,
  },
  
  regulations: {
    childAgeRange: { min: 3, max: 11 },
    infantAgeRange: { min: 0, max: 2 },
    minimumAge: 0, // Accepts all ages
    
    maxOccupancyPerRoom: 3,
    maxAdultsPerRoom: 2,
    maxChildrenPerRoom: 2,
    infantsCountAsOccupancy: false,
    
    roomTypes: [
      {
        type: 'double',
        maxOccupancy: 2,
        maxAdults: 2,
        maxChildren: 0,
        allowInfants: true,
        extraBedAvailable: false,
        description: 'Standard double room with king bed',
      },
      {
        type: 'family',
        maxOccupancy: 4,
        maxAdults: 2,
        maxChildren: 2,
        allowInfants: true,
        extraBedAvailable: true,
        description: 'Family room with double bed + 2 single beds',
      },
    ],
    
    childDiscount: [
      {
        ageRange: { min: 3, max: 11 },
        discountPercent: 50,
        conditions: 'When sharing room with 2 paying adults',
      },
    ],
    
    infantPolicy: {
      freeUpToAge: 2,
      conditions: 'When sharing with parents, no extra bed',
    },
    
    seasonalRules: [
      {
        season: 'peak',
        minimumNights: 2,
        advanceBookingRequired: 90,
      },
    ],
    
    specialRequirements: [
      'Malaria prophylaxis recommended',
      'Warm clothing for cool evenings',
    ],
    
    wheelchairAccessible: false,
    familyFriendly: true,
    adultsOnly: false,
  },
  
  amenities: {
    wifi: true,
    pool: false,
    spa: true,
    restaurant: true,
    bar: true,
    laundry: true,
    airConditioning: false,
    heating: true,
    generator: true,
    safetyBox: true,
    mosquitoNets: true,
    privateBalcony: true,
    viewType: 'forest',
  },
  
  description: 'Luxury eco-lodge with stunning views of the Virunga Volcanoes',
  highlights: [
    'Closest luxury lodge to gorilla trekking starting point',
    'Award-winning eco-friendly design',
    'Exceptional service and cuisine',
  ],
  activities: [
    'Gorilla trekking',
    'Bird watching',
    'Nature walks',
    'Community visits',
  ],
  
  bookingLeadTime: 30,
  cancellationPolicy: 'Free cancellation up to 30 days before arrival',
  
  active: true,
  featured: true,
};
