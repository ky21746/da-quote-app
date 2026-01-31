# 🚀 Itinerary Integration Setup Guide

## ✅ Integration Status: READY

The DA Itinerary Builder API is deployed and ready to use!

---

## 🔧 Setup Instructions

### Step 1: Update Environment Variables

Copy `.env.example` to `.env.local` (if you haven't already):

```bash
cp .env.example .env.local
```

Then edit `.env.local` and make sure these lines are set:

```env
# Itinerary System Integration
REACT_APP_ITINERARY_API_URL=https://europe-west3-da-itinerary-builder.cloudfunctions.net
REACT_APP_ITINERARY_API_KEY=dev_key_12345
```

### Step 2: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Start again
npm start
```

---

## 🧪 Testing the Integration

### 1. Health Check (Optional)

Open browser console and run:

```javascript
fetch('https://europe-west3-da-itinerary-builder.cloudfunctions.net/health')
  .then(r => r.json())
  .then(console.log)
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### 2. Test Full Flow

1. Open DA Quote App: `http://localhost:3000`
2. Create a new trip or open existing one
3. Add parks, lodging, activities
4. Go to **Pricing** page
5. Look for the **"Generate Itinerary"** button (blue box)
6. Click it!

**Expected behavior:**
- Button shows "Generating..."
- After ~5-10 seconds, button changes to "View Itinerary"
- Click "View Itinerary" to see the modal
- Modal shows the generated itinerary with days, activities, etc.

---

## 📡 API Endpoints

All endpoints are at:
```
https://europe-west3-da-itinerary-builder.cloudfunctions.net
```

### Available Endpoints:

1. **POST** `/createItinerary` - Create new itinerary
2. **GET** `/getItinerary/{id}` - Get itinerary by ID
3. **PUT** `/updateItinerary/{id}` - Update itinerary
4. **DELETE** `/deleteItinerary/{id}` - Delete itinerary
5. **GET** `/health` - Health check

### Authentication:

All requests include:
```
X-API-Key: dev_key_12345
```

---

## 🎯 What Gets Sent to the API

When you click "Generate Itinerary", DA Quote App sends:

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
        "parkName": "Murchison Falls National Park",
        "arrival": { "itemName": "Fixed Wing Charter" },
        "lodging": { "itemName": "Entikko Lodge" },
        "activities": [...]
      }
    ]
  },
  "pricing": {
    "totals": {
      "grandTotal": 12450.00,
      "perPerson": 2075.00
    }
  }
}
```

---

## 🐛 Troubleshooting

### Issue: Button doesn't appear
**Solution:** Make sure you're on the Pricing page and have saved the trip.

### Issue: "Please save the trip first"
**Solution:** Save the trip before generating itinerary (trip needs an ID).

### Issue: Network error
**Solution:** 
1. Check `.env.local` has correct URL
2. Check internet connection
3. Verify API is running (health check)

### Issue: Authentication failed
**Solution:** Verify API key in `.env.local` matches: `dev_key_12345`

---

## 📝 Code References

### Files Involved:

1. **API Client:** `src/services/itineraryApi.ts`
   - Handles all HTTP requests
   - Retry logic, error handling
   
2. **UI Button:** `src/components/Itinerary/ItineraryButton.tsx`
   - The "Generate Itinerary" button
   
3. **Modal:** `src/components/Itinerary/ItineraryPreviewModal.tsx`
   - Displays the generated itinerary
   
4. **Integration:** `src/components/Pricing/PricingPage.tsx`
   - Lines 90-197: Generation logic
   - Lines 456-472: Button placement

5. **Types:** `src/types/itinerary.ts`
   - All TypeScript interfaces

---

## 🎨 UI Flow

```
Pricing Page
    ↓
┌─────────────────────────────────────┐
│ Trip Itinerary                      │
│ Generate detailed itinerary...      │
│                                     │
│  [📄 Generate Itinerary]  ← Click  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  [⏳ Generating...]                 │
└─────────────────────────────────────┘
    ↓ (5-10 seconds)
┌─────────────────────────────────────┐
│  [✅ View Itinerary]  ← Click       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Modal with full itinerary           │
│ - Days breakdown                    │
│ - Activities timeline               │
│ - Accommodation details             │
│ - Download options                  │
└─────────────────────────────────────┘
```

---

## 🚀 Production Deployment

When ready for production:

1. Get production API key from itinerary team
2. Update `.env.local`:
   ```env
   REACT_APP_ITINERARY_API_KEY=prod_key_xxxxx
   ```
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

---

## 📞 Support

**API Documentation:** See `ITINERARY_INTEGRATION.md`

**Issues?** Check:
1. Console for errors
2. Network tab in DevTools
3. API health endpoint

---

**Last Updated:** January 31, 2024
**Status:** ✅ READY TO USE
