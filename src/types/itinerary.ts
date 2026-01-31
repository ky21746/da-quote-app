/**
 * Itinerary System Integration Types
 * Defines the contract between DA Quote App and the Itinerary Generation System
 */

import { TripDraft } from './ui';
import { PricingResult } from '../utils/catalogPricingEngine';

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateItineraryRequest {
  tripId: string;
  tripData: TripDraft;
  pricing: PricingResult;
  metadata?: {
    clientName?: string;
    agentName?: string;
    notes?: string;
    preferences?: {
      language?: 'en' | 'he';
      includeImages?: boolean;
      includePricing?: boolean;
      format?: 'detailed' | 'summary';
    };
  };
}

export interface CreateItineraryResponse {
  itineraryId: string;
  status: ItineraryStatus;
  estimatedTime?: number; // seconds until completion
  webhookUrl?: string;
  message?: string;
}

export interface GetItineraryResponse {
  itineraryId: string;
  tripId: string;
  status: ItineraryStatus;
  content?: ItineraryContent;
  documents?: ItineraryDocument[];
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface UpdateItineraryRequest {
  tripData: TripDraft;
  pricing: PricingResult;
  metadata?: CreateItineraryRequest['metadata'];
}

export interface UpdateItineraryResponse {
  success: boolean;
  status: ItineraryStatus;
  message?: string;
}

// ============================================================================
// Itinerary Content Structure
// ============================================================================

export interface ItineraryContent {
  title: string;
  subtitle?: string;
  summary: {
    travelers: number;
    days: number;
    nights: number;
    parks: string[];
    highlights: string[];
  };
  days: ItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
  importantNotes?: string[];
}

export interface ItineraryDay {
  dayNumber: number;
  date?: string;
  title: string;
  description: string;
  images: ItineraryImage[];
  timeline: TimelineItem[];
  highlights: string[];
  accommodation?: AccommodationDetails;
  meals?: {
    breakfast?: boolean;
    lunch?: boolean;
    dinner?: boolean;
  };
  distance?: {
    value: number;
    unit: 'km' | 'miles';
    description?: string;
  };
}

export interface ItineraryImage {
  url: string;
  caption?: string;
  type: 'hero' | 'gallery' | 'activity' | 'accommodation';
  alt?: string;
  width?: number;
  height?: number;
}

export interface TimelineItem {
  time?: string; // "08:00" or "Morning"
  activity: string;
  description: string;
  icon?: string; // Icon name or emoji
  duration?: string; // "2 hours"
  location?: string;
}

export interface AccommodationDetails {
  name: string;
  description: string;
  images: string[];
  amenities: string[];
  roomType?: string;
  rating?: number;
  website?: string;
}

export interface ItineraryDocument {
  type: 'pdf' | 'web' | 'docx';
  url: string;
  title: string;
  size?: number; // bytes
  generatedAt?: string;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface ItineraryWebhookPayload {
  itineraryId: string;
  tripId: string;
  status: ItineraryStatus;
  content?: ItineraryContent;
  documents?: ItineraryDocument[];
  error?: string;
  timestamp: string;
}

// ============================================================================
// Status & Error Types
// ============================================================================

export type ItineraryStatus = 
  | 'none'           // No itinerary created yet
  | 'processing'     // Being generated
  | 'completed'      // Ready
  | 'failed'         // Generation failed
  | 'outdated';      // Trip was updated, itinerary needs regeneration

export interface ItineraryError {
  code: string;
  message: string;
  details?: any;
}

// ============================================================================
// API Configuration
// ============================================================================

export interface ItineraryApiConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number; // milliseconds
  retryAttempts?: number;
  webhookUrl?: string;
}

// ============================================================================
// Local State Types (for DA Quote App)
// ============================================================================

export interface ItineraryState {
  itineraryId?: string;
  status: ItineraryStatus;
  content?: ItineraryContent;
  documents?: ItineraryDocument[];
  error?: ItineraryError;
  lastUpdated?: string;
  isLoading: boolean;
}
