/**
 * Catalog Webhook Service
 * Notifies the Itinerary Builder when catalog items are created or updated
 */

import { PricingItem } from '../types/ui';

const ITINERARY_API_URL = process.env.REACT_APP_ITINERARY_API_URL || 'https://europe-west3-da-itinerary-builder.cloudfunctions.net';
const ITINERARY_API_KEY = process.env.REACT_APP_ITINERARY_API_KEY || '';

interface CatalogWebhookPayload {
  sku: string;
  itemName: string;
  category: string;
  parkId: string | null;
  basePrice: number;
  costType: string;
}

/**
 * Send webhook to Itinerary Builder when a catalog item is created or updated
 * This is fire-and-forget - errors are logged but don't block the UI
 */
export async function notifyItineraryBuilder(item: PricingItem): Promise<void> {
  // Only send webhook if item has a SKU
  if (!item.sku) {
    console.warn('Skipping webhook: item has no SKU', item);
    return;
  }

  const payload: CatalogWebhookPayload = {
    sku: item.sku,
    itemName: item.itemName,
    category: item.category,
    parkId: item.parkId || null,
    basePrice: item.basePrice,
    costType: item.costType,
  };

  try {
    const response = await fetch(`${ITINERARY_API_URL}/onNewCatalogItem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': ITINERARY_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Itinerary Builder webhook failed:', response.status, errorText);
    } else {
      console.log('✅ Itinerary Builder notified:', item.sku);
    }
  } catch (error) {
    // Fire-and-forget: log error but don't throw
    console.error('Failed to notify Itinerary Builder:', error);
  }
}
