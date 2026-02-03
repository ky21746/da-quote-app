# 🔗 Data Mapping: Quote App ↔ Itinerary Builder

## Overview
This document defines the **shared language** between DA Quote App and Itinerary Builder.
Both systems MUST use the **exact same IDs and field names** for seamless integration.

---

## 📤 What Quote App Sends to Itinerary Builder

### API Endpoint
```
POST /createItinerary
```

### Request Payload Structure
```typescript
{
  tripId: string,
  tripData: {
    name: string,
    travelers: number,
    days: number,
    tier?: "Luxury" | "Mid-Range" | "Budget",
    ages?: number[],
    
    tripDays: [
      {
        dayNumber: number,
        parkId: string,              // ← MUST match Admin Panel Park ID
        parkName: string,            // ← MUST match Admin Panel Park Name
        
        lodging: {
          itemId: string,            // ← MUST match Admin Panel Lodge ID
          itemName: string,          // ← MUST match Admin Panel Lodge Name
          category: "Lodging"
        },
        
        activities: [
          {
            itemId: string,          // ← MUST match Admin Panel Activity ID
            itemName: string,        // ← MUST match Admin Panel Activity Name
            category: "Activities"
          }
        ],
        
        logistics?: {
          vehicle: string            // ← MUST match Admin Panel Vehicle ID
        }
      }
    ]
  },
  pricing: { ... },
  metadata: { ... }
}
```

---

## 🎯 Critical Field Mappings

### 1. Parks
**Quote App Field:** `tripDays[].parkId`  
**Quote App Example:** `"park_1"`  
**Admin Panel Must Have:** Content Document with ID = `"park_1"`

**Quote App Field:** `tripDays[].parkName`  
**Quote App Example:** `"Bwindi Impenetrable National Park"`  
**Admin Panel Must Have:** Content Document with Name = `"Bwindi Impenetrable National Park"`

### 2. Lodges
**Quote App Field:** `tripDays[].lodging.itemId`  
**Quote App Example:** `"lodge_clouds_001"`  
**Admin Panel Must Have:** Content Document with ID = `"lodge_clouds_001"`

**Quote App Field:** `tripDays[].lodging.itemName`  
**Quote App Example:** `"Clouds Mountain Gorilla Lodge"`  
**Admin Panel Must Have:** Content Document with Name = `"Clouds Mountain Gorilla Lodge"`

### 3. Activities
**Quote App Field:** `tripDays[].activities[].itemId`  
**Quote App Example:** `"activity_gorilla_001"`  
**Admin Panel Must Have:** Content Document with ID = `"activity_gorilla_001"`

**Quote App Field:** `tripDays[].activities[].itemName`  
**Quote App Example:** `"Gorilla Trekking Permit"`  
**Admin Panel Must Have:** Content Document with Name = `"Gorilla Trekking Permit"`

### 4. Vehicles
**Quote App Field:** `tripDays[].logistics.vehicle`  
**Quote App Example:** `"vehicle_4x4_001"`  
**Admin Panel Must Have:** Content Document with ID = `"vehicle_4x4_001"`

---

## 📋 Admin Panel Setup Instructions

### Step 1: Export All IDs from Quote App
1. Go to: https://discover-africa-quotation-app.web.app/admin/pricing-catalog
2. Click "Export XXX Items" button
3. Download `pricing_catalog_ids.json`

### Step 2: Create Content Documents in Admin Panel
For EACH item in the exported JSON, create a Content Document with:

```
Document ID = item.id          (EXACT MATCH - case sensitive)
Document Name = item.name      (EXACT MATCH - case sensitive)
Category = item.category       (Parks, Lodging, Activities, etc.)
```

### Step 3: Verify Matching
The Itinerary Builder will receive requests like:
```json
{
  "parkId": "park_1",
  "parkName": "Bwindi Impenetrable National Park"
}
```

It MUST find a Content Document where:
- ID = "park_1" AND
- Name = "Bwindi Impenetrable National Park"

If no match found → Error: Cannot generate itinerary

---

## 🔍 Example: Complete Day Mapping

### Quote App Sends:
```json
{
  "dayNumber": 1,
  "parkId": "park_1",
  "parkName": "Bwindi Impenetrable National Park",
  "lodging": {
    "itemId": "lodge_clouds_001",
    "itemName": "Clouds Mountain Gorilla Lodge",
    "category": "Lodging"
  },
  "activities": [
    {
      "itemId": "activity_gorilla_001",
      "itemName": "Gorilla Trekking Permit",
      "category": "Activities"
    }
  ]
}
```

### Admin Panel Must Have:

**Park Document:**
```
ID: park_1
Name: Bwindi Impenetrable National Park
Category: Parks
Content: {
  description: "...",
  images: [...],
  highlights: [...]
}
```

**Lodge Document:**
```
ID: lodge_clouds_001
Name: Clouds Mountain Gorilla Lodge
Category: Lodging
Content: {
  description: "...",
  images: [...],
  amenities: [...]
}
```

**Activity Document:**
```
ID: activity_gorilla_001
Name: Gorilla Trekking Permit
Category: Activities
Content: {
  description: "...",
  duration: "...",
  requirements: [...]
}
```

---

## ⚠️ Critical Rules

1. **IDs are CASE SENSITIVE**
   - `park_1` ≠ `Park_1` ≠ `PARK_1`

2. **Names are CASE SENSITIVE**
   - `"Bwindi Impenetrable National Park"` ≠ `"bwindi impenetrable national park"`

3. **NO Spaces in IDs**
   - ✅ `lodge_clouds_001`
   - ❌ `lodge clouds 001`

4. **Underscores in IDs**
   - Use underscores `_` not hyphens `-`
   - ✅ `activity_gorilla_001`
   - ❌ `activity-gorilla-001`

5. **Category Names Must Match**
   - Quote App uses: `"Parks"`, `"Lodging"`, `"Activities"`, `"Vehicle"`
   - Admin Panel must use EXACT same names

---

## 🚀 How to Use This

### For Itinerary Builder Development:
1. Read the exported `pricing_catalog_ids.json`
2. For each item, create a Content Document in Admin Panel
3. When receiving API request, match by ID first, then verify name
4. If match found, use the Content Document data to generate itinerary
5. If no match, return error with missing ID/name

### For Testing:
1. Send test request with known IDs (e.g., `park_1`)
2. Verify Admin Panel has matching document
3. Check that itinerary generation succeeds
4. Verify correct content is used

---

## 📊 Complete ID List

See `pricing_catalog_ids.json` for the complete list of all IDs and names.

This file is the **single source of truth** for ID/name mappings between systems.

---

## 🔄 Sync Process

When Quote App adds new items:
1. New items get new IDs in pricingCatalog
2. Export updated `pricing_catalog_ids.json`
3. Add new Content Documents to Admin Panel
4. Itinerary Builder can now use new items

---

## 📞 Communication Flow

```
Quote App → API Request → Itinerary Builder
            (with IDs)
                ↓
        Admin Panel Lookup
        (match by ID + Name)
                ↓
        Content Document Found
                ↓
        Generate Itinerary
                ↓
        Return to Quote App
```

---

**Last Updated:** 2026-02-03
**Version:** 1.0
