/**
 * Itinerary API Client
 * Handles all communication with the Itinerary Generation System
 * 
 * Features:
 * - JWT Authentication
 * - Automatic retry with exponential backoff
 * - Request timeout handling
 * - Error normalization
 * - Rate limiting protection
 */

import {
  CreateItineraryRequest,
  CreateItineraryResponse,
  GetItineraryResponse,
  UpdateItineraryRequest,
  UpdateItineraryResponse,
  ItineraryApiConfig,
  ItineraryError,
} from '../types/itinerary';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: Partial<ItineraryApiConfig> = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
};

// ============================================================================
// API Client Class
// ============================================================================

export class ItineraryApiClient {
  private config: ItineraryApiConfig;
  private authToken?: string;

  constructor(config: ItineraryApiConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ==========================================================================
  // Authentication
  // ==========================================================================

  /**
   * Set authentication token (JWT or API key)
   */
  setAuthToken(token: string) {
    this.authToken = token;
  }

  /**
   * Get auth headers
   */
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    } else if (this.config.apiKey) {
      headers['X-API-Key'] = this.config.apiKey;
    }

    return headers;
  }

  // ==========================================================================
  // Core Request Method with Retry Logic
  // ==========================================================================

  private async request<T>(
    endpoint: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
        
        if (attempt < (this.config.retryAttempts || 3)) {
          await this.sleep(waitTime);
          return this.request<T>(endpoint, options, attempt + 1);
        }
        
        throw this.createError('RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.');
      }

      // Handle server errors with retry
      if (response.status >= 500 && attempt < (this.config.retryAttempts || 3)) {
        const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        await this.sleep(backoffTime);
        return this.request<T>(endpoint, options, attempt + 1);
      }

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        throw this.createError(
          data.code || 'API_ERROR',
          data.message || `Request failed with status ${response.status}`,
          data
        );
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error.name === 'AbortError') {
        throw this.createError('TIMEOUT', 'Request timeout. Please try again.');
      }

      // Handle network errors with retry
      if (error.message === 'Failed to fetch' && attempt < (this.config.retryAttempts || 3)) {
        const backoffTime = Math.pow(2, attempt) * 1000;
        await this.sleep(backoffTime);
        return this.request<T>(endpoint, options, attempt + 1);
      }

      // Re-throw if already an ItineraryError
      if (error.code) {
        throw error;
      }

      // Wrap unknown errors
      throw this.createError('NETWORK_ERROR', error.message || 'Network request failed', error);
    }
  }

  // ==========================================================================
  // Public API Methods
  // ==========================================================================

  /**
   * Create a new itinerary
   */
  async createItinerary(request: CreateItineraryRequest): Promise<CreateItineraryResponse> {
    return this.request<CreateItineraryResponse>('/api/itinerary/create', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get itinerary by ID
   */
  async getItinerary(itineraryId: string): Promise<GetItineraryResponse> {
    return this.request<GetItineraryResponse>(`/api/itinerary/${itineraryId}`, {
      method: 'GET',
    });
  }

  /**
   * Update existing itinerary
   */
  async updateItinerary(
    itineraryId: string,
    request: UpdateItineraryRequest
  ): Promise<UpdateItineraryResponse> {
    return this.request<UpdateItineraryResponse>(`/api/itinerary/${itineraryId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  /**
   * Delete itinerary
   */
  async deleteItinerary(itineraryId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/itinerary/${itineraryId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string; version?: string }> {
    return this.request<{ status: string; version?: string }>('/api/health', {
      method: 'GET',
    });
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createError(code: string, message: string, details?: any): ItineraryError {
    return {
      code,
      message,
      details,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let apiClientInstance: ItineraryApiClient | null = null;

/**
 * Get or create the API client instance
 */
export function getItineraryApiClient(): ItineraryApiClient {
  if (!apiClientInstance) {
    // Get config from environment variables
    const baseUrl = process.env.REACT_APP_ITINERARY_API_URL || 'http://localhost:3001';
    const apiKey = process.env.REACT_APP_ITINERARY_API_KEY || '';
    const webhookUrl = process.env.REACT_APP_ITINERARY_WEBHOOK_URL;

    apiClientInstance = new ItineraryApiClient({
      baseUrl,
      apiKey,
      webhookUrl,
      timeout: 30000,
      retryAttempts: 3,
    });
  }

  return apiClientInstance;
}

/**
 * Reset the API client instance (useful for testing)
 */
export function resetItineraryApiClient() {
  apiClientInstance = null;
}
