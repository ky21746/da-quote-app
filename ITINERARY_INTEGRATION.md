# 📄 Itinerary System Integration Guide

## Overview
This document provides complete specifications for integrating an external Itinerary Generation System with DA Quote App.

---

## 🎯 What DA Quote App Provides

### 1. Trip Data Structure

```typescript
interface TripDataPayload {
  tripId: string;
  tripData: {
    name: string;
    travelers: number;
    ages?: number[];
    days: number;
    travelMonth?: number;
    tripDays: Array<{
      dayNumber: number;
      parkId?: string;
      parkName?: string;
      arrival?: {
        itemId: string;
        itemName: string;
        route?: string;
        type: 'helicopter' | 'fixed-wing' | 'vehicle';
      };
      lodging?: {
        itemId: string;
        itemName: string;
        roomType?: string;
        season?: string;
        occupancy?: string;
      };
      activities?: Array<{
        itemId: string;
        itemName: string;
        category: string;
      }>;
      parkFees?: Array<{
        itemId: string;
        itemName: string;
      }>;
    }>;
  };
  pricing: {
    breakdown: Array<{
      park: string;
      category: string;
      itemName: string;
      basePrice: number;
      calculatedTotal: number;
      perPerson: number;
      calculationExplanation: string;
    }>;
    totals: {
      grandTotal: number;
      perPerson: number;
    };
  };
  metadata?: {
    clientName?: string;
    agentName?: string;
    notes?: string;
    preferences?: {
      language: 'en' | 'he';
      includeImages: boolean;
      includePricing: boolean;
      format: 'detailed' | 'summary';
    };
  };
}
```

### 2. Example Request

```json
{
  "tripId": "trip_abc123",
  "tripData": {
    "name": "5-Day Uganda Safari",
    "travelers": 6,
    "ages": [35, 33, 8, 6, 4, 2],
    "days": 5,
    "travelMonth": 6,
    "tripDays": [
      {
        "dayNumber": 1,
        "parkId": "MURCHISON_FALLS",
        "parkName": "Murchison Falls National Park",
        "arrival": {
          "itemId": "aviation_001",
          "itemName": "Fixed Wing Charter - D1900 - Entebbe (EBB) to Pakuba",
          "route": "Entebbe to Pakuba",
          "type": "fixed-wing"
        },
        "lodging": {
          "itemId": "lodging_001",
          "itemName": "Entikko Lodge",
          "roomType": "Standard Room",
          "season": "Low Season",
          "occupancy": "double"
        },
        "activities": [
          {
            "itemId": "activity_001",
            "itemName": "Game Drive - Day (with UWA Guide)",
            "category": "Activities"
          }
        ],
        "parkFees": [
          {
            "itemId": "park_fee_001",
            "itemName": "Murchison Park Entry Fee (FNR)"
          }
        ]
      }
    ]
  },
  "pricing": {
    "breakdown": [
      {
        "park": "Murchison Falls National Park",
        "category": "Park Fees",
        "itemName": "Murchison Park Entry Fee (FNR)",
        "basePrice": 45.00,
        "calculatedTotal": 270.00,
        "perPerson": 45.00,
        "calculationExplanation": "45 × 6 travelers"
      }
    ],
    "totals": {
      "grandTotal": 62915.00,
      "perPerson": 10485.83
    }
  },
  "metadata": {
    "preferences": {
      "language": "en",
      "includeImages": true,
      "includePricing": true,
      "format": "detailed"
    }
  }
}
```

---

## 🔌 Required API Endpoints

### 1. Create Itinerary

**Endpoint:** `POST /api/itinerary/create`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
X-API-Key: {API_KEY}
```

**Request Body:** (See TripDataPayload above)

**Response:**
```json
{
  "itineraryId": "itin_xyz789",
  "status": "processing",
  "estimatedTime": 30,
  "message": "Itinerary generation started"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Invalid request data
- `401` - Unauthorized
- `429` - Rate limit exceeded
- `500` - Server error

---

### 2. Get Itinerary

**Endpoint:** `GET /api/itinerary/{itineraryId}`

**Request Headers:**
```
Authorization: Bearer {JWT_TOKEN}
X-API-Key: {API_KEY}
```

**Response:**
```json
{
  "itineraryId": "itin_xyz789",
  "tripId": "trip_abc123",
  "status": "completed",
  "content": {
    "title": "5-Day Uganda Safari Adventure",
    "subtitle": "Murchison Falls & Bwindi Impenetrable Forest",
    "summary": {
      "travelers": 6,
      "days": 5,
      "nights": 4,
      "parks": ["Murchison Falls NP", "Bwindi Impenetrable NP"],
      "highlights": [
        "Gorilla trekking in Bwindi",
        "Game drives in Murchison Falls",
        "Boat safari on the Nile"
      ]
    },
    "days": [
      {
        "dayNumber": 1,
        "date": "2024-06-15",
        "title": "Arrival at Murchison Falls",
        "description": "Begin your adventure with a scenic flight...",
        "images": [
          {
            "url": "https://cdn.example.com/murchison-aerial.jpg",
            "caption": "Aerial view of Murchison Falls",
            "type": "hero",
            "alt": "Murchison Falls from above"
          }
        ],
        "timeline": [
          {
            "time": "08:00",
            "activity": "Departure from Entebbe",
            "description": "Board your private charter flight...",
            "icon": "✈️",
            "duration": "1.5 hours"
          },
          {
            "time": "09:30",
            "activity": "Arrival at Pakuba Airstrip",
            "description": "Touch down in the heart of the park...",
            "icon": "📍"
          }
        ],
        "highlights": [
          "Private charter flight",
          "First game drive",
          "Sunset at the lodge"
        ],
        "accommodation": {
          "name": "Entikko Lodge",
          "description": "Luxury tented camp overlooking the Nile...",
          "images": ["lodge1.jpg", "lodge2.jpg"],
          "amenities": ["Pool", "Restaurant", "WiFi", "Spa"],
          "roomType": "Standard Room",
          "rating": 4.5
        },
        "meals": {
          "breakfast": false,
          "lunch": true,
          "dinner": true
        }
      }
    ],
    "inclusions": [
      "All park entry fees",
      "Accommodation as specified",
      "All meals as indicated",
      "Private transportation",
      "Professional guide services"
    ],
    "exclusions": [
      "International flights",
      "Travel insurance",
      "Personal expenses",
      "Tips and gratuities"
    ],
    "importantNotes": [
      "Gorilla permits are subject to availability",
      "Minimum age for gorilla trekking is 15 years",
      "Yellow fever vaccination required"
    ]
  },
  "documents": [
    {
      "type": "pdf",
      "url": "https://cdn.example.com/itinerary_trip_abc123.pdf",
      "title": "Complete Itinerary - 5 Day Uganda Safari",
      "size": 2457600,
      "generatedAt": "2024-01-31T19:00:00Z"
    },
    {
      "type": "web",
      "url": "https://itinerary.example.com/trip_abc123",
      "title": "Interactive Web Itinerary"
    }
  ],
  "createdAt": "2024-01-31T18:55:00Z",
  "updatedAt": "2024-01-31T19:00:00Z"
}
```

---

### 3. Update Itinerary

**Endpoint:** `PUT /api/itinerary/{itineraryId}`

**Request Headers:**
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
X-API-Key: {API_KEY}
```

**Request Body:**
```json
{
  "tripData": { /* Updated trip data */ },
  "pricing": { /* Updated pricing */ },
  "metadata": { /* Optional metadata */ }
}
```

**Response:**
```json
{
  "success": true,
  "status": "processing",
  "message": "Itinerary update started"
}
```

---

### 4. Delete Itinerary

**Endpoint:** `DELETE /api/itinerary/{itineraryId}`

**Request Headers:**
```
Authorization: Bearer {JWT_TOKEN}
X-API-Key: {API_KEY}
```

**Response:**
```json
{
  "success": true
}
```

---

### 5. Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## 🔔 Webhook Support (Optional but Recommended)

If itinerary generation takes time, implement webhook callbacks:

**Webhook URL:** Provided by DA Quote App in create request

**Webhook Payload:**
```json
{
  "itineraryId": "itin_xyz789",
  "tripId": "trip_abc123",
  "status": "completed",
  "content": { /* Full itinerary content */ },
  "documents": [ /* Generated documents */ ],
  "timestamp": "2024-01-31T19:00:00Z"
}
```

**Webhook Headers:**
```
Content-Type: application/json
X-Webhook-Signature: {HMAC_SHA256_SIGNATURE}
```

---

## 🔐 Authentication

### Option 1: JWT Bearer Token
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Option 2: API Key
```
X-API-Key: your_api_key_here
```

**Recommended:** Use both for maximum security.

---

## ⚡ Rate Limiting

**Recommended Limits:**
- 100 requests per minute per API key
- 10 concurrent itinerary generations per account

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706731200
Retry-After: 60
```

---

## 🎨 Image Requirements

### Image Specifications:
- **Format:** JPEG, PNG, WebP
- **Hero Images:** 1920x1080px minimum
- **Gallery Images:** 1200x800px minimum
- **Thumbnails:** 400x300px
- **File Size:** Max 2MB per image
- **CDN:** Use CDN for fast delivery

### Required Images Per Day:
- 1 hero image (park/location)
- 2-4 gallery images (activities, accommodation)
- Accommodation images (2-3 per lodge)

---

## 📊 Content Requirements

### Day Description:
- **Length:** 150-300 words
- **Tone:** Professional, engaging, descriptive
- **Include:** Location details, activity descriptions, travel logistics

### Timeline Items:
- **Time:** HH:MM format or descriptive (Morning, Afternoon)
- **Activity:** Clear, concise title
- **Description:** 50-100 words
- **Duration:** If applicable

### Accommodation Details:
- **Name:** Official lodge/hotel name
- **Description:** 100-200 words
- **Amenities:** List of key features
- **Images:** 2-3 high-quality photos

---

## 🚨 Error Handling

### Error Response Format:
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "tripData.travelers",
    "issue": "Must be greater than 0"
  }
}
```

### Common Error Codes:
- `INVALID_TRIP_DATA` - Malformed trip data
- `MISSING_REQUIRED_FIELD` - Required field missing
- `ITINERARY_NOT_FOUND` - Itinerary ID doesn't exist
- `GENERATION_FAILED` - Failed to generate itinerary
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `AUTHENTICATION_FAILED` - Invalid credentials
- `TIMEOUT` - Request timeout

---

## 🧪 Testing

### Test Endpoint:
`POST /api/itinerary/test`

Accepts same payload as create but returns mock data immediately for testing.

### Sample Test Data:
```bash
curl -X POST https://your-api.com/api/itinerary/test \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_key_123" \
  -d @sample_trip.json
```

---

## 📦 Environment Variables (DA Quote App Side)

```env
# Itinerary System Integration
REACT_APP_ITINERARY_API_URL=https://your-itinerary-api.com
REACT_APP_ITINERARY_API_KEY=your_api_key_here
REACT_APP_ITINERARY_WEBHOOK_URL=https://da-quote-app.com/api/webhooks/itinerary
```

---

## 🔄 Integration Flow

```
1. User completes quote in DA Quote App
2. User clicks "Generate Itinerary"
3. DA Quote App → POST /api/itinerary/create
4. Itinerary System processes data (async)
5. Itinerary System → Webhook callback (when ready)
6. DA Quote App updates status
7. User clicks "View Itinerary"
8. DA Quote App → GET /api/itinerary/{id}
9. Display itinerary in modal
```

---

## 📝 Implementation Checklist

### Itinerary System Must Provide:
- [ ] POST /api/itinerary/create endpoint
- [ ] GET /api/itinerary/{id} endpoint
- [ ] PUT /api/itinerary/{id} endpoint
- [ ] DELETE /api/itinerary/{id} endpoint
- [ ] GET /api/health endpoint
- [ ] Authentication (JWT or API Key)
- [ ] Rate limiting
- [ ] Error handling
- [ ] Webhook support (recommended)
- [ ] Image CDN
- [ ] PDF generation
- [ ] Web viewer (optional)

### DA Quote App Provides:
- [x] API Client with retry logic
- [x] Authentication headers
- [x] Request/response types
- [x] UI components (button, modal)
- [x] State management
- [x] Error handling
- [x] Loading states
- [x] Webhook endpoint (if needed)

---

## 🎯 Success Criteria

### Performance:
- Itinerary generation: < 60 seconds
- API response time: < 2 seconds
- Image loading: < 3 seconds
- PDF generation: < 10 seconds

### Quality:
- Accurate trip data parsing
- High-quality images
- Professional descriptions
- Proper formatting
- Mobile-responsive

### Reliability:
- 99.9% uptime
- Automatic retries
- Graceful error handling
- Data validation

---

## 📞 Support

For integration support, contact:
- **Email:** support@da-quote-app.com
- **Documentation:** https://docs.da-quote-app.com/itinerary
- **API Status:** https://status.da-quote-app.com

---

## 🔄 Versioning

**Current API Version:** v1

**Version Header:**
```
X-API-Version: v1
```

**Deprecation Notice:** 90 days before breaking changes

---

**Last Updated:** January 31, 2024
**Document Version:** 1.0.0
