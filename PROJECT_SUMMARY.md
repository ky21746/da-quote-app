# DA Quote App - Complete Project Summary

**Version:** 1.0  
**Last Updated:** February 6, 2026  
**Project ID:** discover-africa-quotation-app  
**Production URL:** https://discover-africa-quotation-app.web.app

---

## 🎯 Project Overview

**DA Quote App** is a comprehensive trip pricing and quotation system for Uganda safari tours. It enables travel agents to create detailed trip quotes with day-by-day planning, pricing calculations, and automated itinerary generation.

**Primary Purpose:**
- Create and manage safari trip quotes
- Calculate pricing based on catalog items (lodges, activities, vehicles, etc.)
- Generate detailed PDF quotes
- Integrate with external Itinerary Builder system for content generation

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 18.2.0 with TypeScript 4.9.5
- **Routing:** React Router DOM 6.20.0
- **Styling:** TailwindCSS 3.3.0 + PostCSS + Autoprefixer
- **Icons:** Lucide React 0.561.0
- **Build Tool:** Create React App (react-scripts 5.0.1)

### Backend & Infrastructure
- **Database:** Firebase Firestore (NoSQL)
- **Authentication:** Firebase Auth (Email/Password)
- **Hosting:** Firebase Hosting
- **File Storage:** Firebase Storage (for PDFs)
- **External API:** DA Itinerary Builder (Firebase Cloud Functions)

### Development Tools
- **Testing:** Jest (21 unit tests for pricing engine)
- **Validation:** AJV 8.17.1 (JSON Schema validation)
- **PDF Generation:** jsPDF 3.0.4
- **Environment:** dotenv 17.2.3

### Deployment
- **CI/CD:** GitHub Actions (unit test enforcement)
- **Hosting:** Firebase Hosting with cache control headers
- **Build:** Production-optimized React build

---

## 📁 Project Structure

```
da-quote-app/
├── src/
│   ├── components/          # React UI components (98 items)
│   │   ├── Admin/          # Admin panel components
│   │   ├── Pricing/        # Pricing calculation UI
│   │   ├── Parks/          # Trip day planning
│   │   ├── Itinerary/      # Itinerary preview/generation
│   │   ├── Leads/          # Lead management
│   │   ├── common/         # Reusable UI components
│   │   └── layout/         # Layout components
│   │
│   ├── context/            # React Context providers (5 items)
│   │   ├── TripContext.tsx           # Trip draft state management
│   │   ├── PricingCatalogContext.tsx # Pricing catalog data
│   │   ├── AuthContext.tsx           # Authentication state
│   │   └── LanguageContext.tsx       # i18n support
│   │
│   ├── types/              # TypeScript type definitions (7 items)
│   │   ├── ui.ts           # Core UI types (TripDraft, PricingItem, etc.)
│   │   ├── itinerary.ts    # Itinerary API types
│   │   ├── leads.ts        # Lead management types
│   │   ├── lodging.ts      # Hierarchical lodging types
│   │   ├── parks.ts        # Park types
│   │   ├── catalog.ts      # Catalog types
│   │   └── favorites.ts    # User favorites types
│   │
│   ├── utils/              # Utility functions (17 items)
│   │   ├── catalogPricingEngine.ts   # Core pricing calculations
│   │   ├── pricingCatalogHelpers.ts  # Catalog filtering/selection
│   │   ├── parks.ts                  # Park data access
│   │   ├── currencyFormatter.ts      # Currency display
│   │   └── __tests__/                # Unit tests (21 tests)
│   │
│   ├── services/           # External service integrations (5 items)
│   │   ├── itineraryApi.ts           # Itinerary Builder API client
│   │   ├── AutoItineraryBuilder.ts   # Auto-trip generation
│   │   ├── quoteService.ts           # Quote CRUD operations
│   │   ├── leadService.ts            # Lead management
│   │   └── pdfService.ts             # PDF generation
│   │
│   ├── constants/          # Static data (1 item)
│   │   └── parks.ts        # 15 Uganda parks/locations
│   │
│   ├── hooks/              # Custom React hooks (9 items)
│   ├── pages/              # Top-level page components (15 items)
│   ├── routes/             # Routing configuration
│   ├── core/               # Business logic layer (34 items)
│   ├── data/               # Data access layer (27 items)
│   └── app/                # Application configuration (6 items)
│
├── public/                 # Static assets
├── build/                  # Production build output
├── scripts/                # Build and utility scripts
├── firestore.rules         # Firestore security rules
├── firestore.indexes.json  # Firestore indexes
├── firebase.json           # Firebase configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.js      # TailwindCSS configuration
├── .env.example            # Environment variables template
├── .env.local              # Local environment (gitignored)
├── .env.production         # Production environment (gitignored)
├── README.md               # Architecture documentation
├── TESTING.md              # Testing documentation
├── CI_ENFORCEMENT.md       # CI/CD documentation
└── ITINERARY_DATA_MAPPING.md  # Integration documentation
```

---

## 📊 Data Models & Entities

### Core Entities

#### 1. **TripDraft** (Primary entity for quotes)
```typescript
interface TripDraft {
  // Basic Info
  name: string;                    // Trip name
  travelers: number;               // Number of travelers
  ages?: number[];                 // Age of each traveler
  days: number;                    // Total trip days
  travelMonth?: number;            // 1-12 for seasonality
  tier: TripTier;                  // 'budget' | 'standard' | 'luxury' | 'ultra-luxury'
  
  // Trip Structure
  tripDays?: TripDay[];            // Day-by-day planning (NEW structure)
  parks?: ParkCard[];              // Park-based planning (DEPRECATED)
  
  // Pricing
  itemQuantities?: Record<string, number>;           // Manual quantity overrides
  itemQuantitySources?: Record<string, 'auto' | 'manual'>;
  unexpectedPercentage?: number;                     // Unexpected costs %
  localAgentCommissionPercentage?: number;           // Agent commission %
  myProfitPercentage?: number;                       // Profit margin %
  markup?: Markup;                                   // Final markup
  manualLineItems?: LineItemDraft[];                 // Custom line items
  
  // Itinerary Integration
  itineraryId?: string;                              // Generated itinerary ID
  itineraryStatus?: 'none' | 'processing' | 'completed' | 'failed' | 'outdated';
  itineraryLastGenerated?: string;                   // ISO timestamp
}
```

#### 2. **TripDay** (Day-by-day structure)
```typescript
interface TripDay {
  dayNumber: number;               // 1, 2, 3... (global trip day)
  parkId?: string;                 // Park for this day
  
  // Logistics
  arrival?: string;                // pricingItemId (flight/transfer)
  arrivalNA?: boolean;             // Mark as N/A
  
  // Accommodation
  lodging?: string;                // pricingItemId (simple lodging)
  lodgingConfig?: {                // Hierarchical lodging config
    roomType: string;
    roomTypeName: string;
    season: string;
    seasonName: string;
    occupancy: string;
    price: number;
    priceType: 'perRoom' | 'perPerson' | 'perVilla';
    requiredQuantity?: number;
  };
  lodgingAllocations?: Array<{     // Split-room allocations
    roomType: string;
    roomTypeName: string;
    season: string;
    seasonName: string;
    occupancy: string;
    price: number;
    priceType: 'perRoom' | 'perPerson' | 'perVilla';
    quantity: number;              // Number of rooms
    guests: number;                // Guests in this room type
  }>;
  
  // Activities & Extras
  activities: string[];            // pricingItemIds
  activitiesNA?: boolean;
  extras?: string[];               // pricingItemIds
  extrasNA?: boolean;
  
  // Park Fees
  parkFees?: TripDayParkFee[];     // Auto-generated park fees
  
  // Transport
  logistics?: {
    vehicle?: string;              // pricingItemId
    internalMovements: string[];   // pricingItemIds
    notes?: string;
  };
  
  // Custom Items
  freeHandLines?: FreeHandLine[];  // Manual line items
}
```

#### 3. **PricingItem** (Catalog items)
```typescript
interface PricingItem {
  id: string;                      // Unique ID (e.g., "lodge_clouds_001")
  parkId?: string | null;          // null = Global, else park-specific
  category: PricingCategory;       // 'Aviation' | 'Lodging' | 'Vehicle' | 'Activities' | 'Park Fees' | 'Permits' | 'Extras' | 'Logistics'
  itemName: string;                // Display name
  basePrice: number;               // Base price in USD
  costType: ManualCostType;        // Pricing model
  capacity?: number;               // Physical capacity (e.g., vehicle seats)
  quantity?: number;               // Default quantity
  appliesTo: 'Global' | 'Park';    // Scope
  active: boolean;                 // Visibility flag
  notes?: string;
  sku?: string;                    // SKU code
  metadata?: any;                  // Hierarchical pricing data (lodging)
}
```

**Cost Types:**
- `fixed_group` - Fixed price for entire group
- `fixed_per_day` - Fixed price per day
- `per_person` - Price per person
- `per_person_per_day` - Price per person per day
- `per_night` - Fixed price per night
- `per_night_per_person` - Price per person per night
- `per_guide` - Price per guide
- `hierarchical_lodging` - Complex lodging with rooms/seasons/occupancy

#### 4. **Park** (Location data)
```typescript
interface Park {
  id: string;                      // e.g., "MURCHISON", "BWINDI"
  label: string;                   // e.g., "Murchison Falls National Park"
}
```

**15 Parks/Locations:**
1. MURCHISON - Murchison Falls National Park
2. BWINDI - Bwindi Impenetrable National Park
3. QUEEN_ELIZABETH - Queen Elizabeth National Park
4. KIBALE - Kibale Forest National Park
5. MGAHINGA - Mgahinga Gorilla National Park
6. KIDEPO - Kidepo Valley National Park
7. LAKE_MBURO - Lake Mburo National Park
8. MT_ELGON - Mt Elgon National Park
9. RWENZORI - Rwenzori Mountains National Park
10. SEMULIKI - Semuliki National Park
11. ZIWA - Ziwa Rhino Sanctuary
12. BUSIKA - Busika
13. ENTEBBE - Entebbe
14. LAKE_BUNYONYI - Lake Bunyonyi
15. JINJA - Jinja

#### 5. **Lead** (Lead management)
```typescript
interface Lead {
  id: string;
  ownerId: string;                 // User who created the lead
  contactName: string;
  email?: string;
  phone?: string;
  status: LeadStatus;              // 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST'
  notes?: string;
  linkedQuoteId?: string;          // Associated trip quote
  createdAt: string;
  updatedAt: string;
}
```

#### 6. **CalculationResult** (Pricing output)
```typescript
interface CalculationResult {
  calculationId: string;
  tripId: string;
  total: string;                   // Formatted total (e.g., "$6,730")
  pricePerPerson: string;          // Formatted per-person price
  breakdown: CategoryBreakdown[];  // Itemized breakdown
  markup: MarkupDisplay;           // Markup details
  warnings: string[];              // Validation warnings
}
```

---

## 🔥 Firestore Collections

### 1. **trips** (Trip quotes)
```
Collection: trips
Document ID: Auto-generated
Fields:
  - userId: string (owner)
  - name: string
  - travelers: number
  - days: number
  - tier: string
  - tripDays: array
  - itemQuantities: map
  - unexpectedPercentage: number
  - localAgentCommissionPercentage: number
  - myProfitPercentage: number
  - itineraryId: string
  - itineraryStatus: string
  - createdAt: timestamp
  - updatedAt: timestamp
  
Security Rules:
  - Read/Write: Only owner (userId == auth.uid)
```

### 2. **pricingCatalog** (Pricing items)
```
Collection: pricingCatalog
Document ID: Auto-generated or custom
Fields:
  - parkId: string | null
  - category: string
  - itemName: string
  - basePrice: number
  - costType: string
  - capacity: number
  - quantity: number
  - appliesTo: string
  - active: boolean
  - notes: string
  - sku: string
  - metadata: map
  
Security Rules:
  - Read: Authenticated users
  - Write: Admin only

Current Items: 143 total
  - Parks: 15
  - Lodges: 16
  - Activities: 58
  - Vehicles: 2
  - Aviation: 21
  - Park Fees: 13
  - Permits: 5
  - Extras: 3
  - Logistics: 0
  - Other: 10
```

### 3. **leads** (Lead management)
```
Collection: leads
Document ID: Auto-generated
Fields:
  - ownerId: string
  - contactName: string
  - email: string
  - phone: string
  - status: string
  - notes: string
  - linkedQuoteId: string
  - createdAt: timestamp
  - updatedAt: timestamp
  
Security Rules:
  - Read/Write: Only owner (ownerId == auth.uid)
```

### 4. **users** (User profiles)
```
Collection: users
Document ID: Firebase Auth UID
Fields:
  - email: string
  - displayName: string
  - role: string ('admin' | 'user')
  - createdAt: timestamp
  
Security Rules:
  - Read: Own document only
  - Write: Own document only (limited fields)
```

### 5. **favorites** (User favorites)
```
Collection: users/{userId}/favorites
Document ID: pricingItemId
Fields:
  - itemId: string
  - category: string
  - parkId: string
  - createdAt: timestamp
  
Security Rules:
  - Read/Write: Only owner
```

---

## 🔌 API Endpoints & Integrations

### External API: DA Itinerary Builder

**Base URL:** `https://europe-west3-da-itinerary-builder.cloudfunctions.net`

#### 1. **Create Itinerary**
```
POST /createItinerary
Headers:
  - x-api-key: {REACT_APP_ITINERARY_API_KEY}
  - Content-Type: application/json

Request Body:
{
  tripId: string,
  tripData: {
    name: string,
    travelers: number,
    days: number,
    tier?: string,
    ages?: number[],
    tripDays: [
      {
        dayNumber: number,
        parkId: string,
        parkName: string,
        lodging: {
          itemId: string,
          itemName: string,
          category: "Lodging"
        },
        activities: [
          {
            itemId: string,
            itemName: string,
            category: "Activities"
          }
        ],
        logistics?: {
          vehicle: string
        }
      }
    ]
  },
  pricing: {
    total: number,
    breakdown: array
  },
  metadata: {
    preferences: {
      language: string,
      includeImages: boolean,
      includePricing: boolean,
      format: string
    }
  }
}

Response:
{
  itineraryId: string,
  status: 'processing' | 'completed' | 'failed',
  message?: string
}
```

#### 2. **Get Itinerary Status**
```
GET /itinerary/{itineraryId}/status
Headers:
  - x-api-key: {REACT_APP_ITINERARY_API_KEY}

Response:
{
  itineraryId: string,
  status: 'processing' | 'completed' | 'failed',
  progress?: number,
  error?: string
}
```

#### 3. **Get Itinerary Content**
```
GET /itinerary/{itineraryId}
Headers:
  - x-api-key: {REACT_APP_ITINERARY_API_KEY}

Response:
{
  itineraryId: string,
  tripId: string,
  content: {
    title: string,
    days: array,
    metadata: object
  },
  createdAt: string,
  updatedAt: string
}
```

### Internal Services

#### Quote Service (`quoteService.ts`)
- `saveQuote(tripDraft, userId)` - Save trip to Firestore
- `loadQuote(tripId)` - Load trip from Firestore
- `deleteQuote(tripId)` - Delete trip
- `listQuotes(userId)` - List user's trips

#### Lead Service (`leadService.ts`)
- `createLead(lead)` - Create new lead
- `updateLead(leadId, updates)` - Update lead
- `deleteLead(leadId)` - Delete lead
- `getLeads(userId)` - Get user's leads

#### PDF Service (`pdfService.ts`)
- `generateQuotePDF(tripDraft, calculation)` - Generate PDF quote
- Returns: Blob for download

---

## 🔄 Data Flow

### 1. **Trip Creation Flow**
```
User → HomePage
  ↓
Create New Trip
  ↓
TripContext (localStorage + Firestore)
  ↓
PricingPage (Trip Builder UI)
  ↓
Select Parks, Lodges, Activities
  ↓
PricingCatalogContext (Firestore snapshot)
  ↓
catalogPricingEngine.calculate()
  ↓
Display Pricing Breakdown
```

### 2. **Pricing Calculation Flow**
```
TripDraft (with tripDays)
  ↓
catalogPricingEngine.ts
  ↓
For each TripDay:
  - Calculate lodging (nights × price)
  - Calculate activities (per-person or fixed)
  - Calculate park fees (auto-added)
  - Calculate vehicles (per-day)
  - Calculate extras
  ↓
Apply quantity overrides (itemQuantities)
  ↓
Apply adjustments:
  - Unexpected costs %
  - Agent commission %
  - Profit margin %
  ↓
Return PricingResult:
  - Line items by category
  - Subtotals
  - Total
  - Warnings
```

### 3. **Itinerary Generation Flow**
```
User clicks "Generate Itinerary"
  ↓
Enrich trip data (fetch full item details)
  ↓
POST /createItinerary (Itinerary Builder API)
  ↓
Poll status every 2 seconds
  ↓
Status: 'processing' → Continue polling
Status: 'completed' → Show preview modal
Status: 'failed' → Show error
  ↓
User views itinerary in modal
  ↓
Option to regenerate or close
```

### 4. **Data Synchronization**
```
PricingCatalogContext:
  - onSnapshot(pricingCatalog) → Real-time updates
  - Items cached in React state
  - Filters applied client-side

TripContext:
  - localStorage for draft persistence
  - Firestore for saved trips
  - Auto-save on changes (debounced)

AuthContext:
  - Firebase Auth state listener
  - User profile from Firestore
  - Role-based access control
```

---

## ✅ Current State

### **What Works (Production-Ready)**

#### Core Features
- ✅ **Trip Creation & Management**
  - Create, edit, delete trips
  - Day-by-day planning with TripDay structure
  - Park selection from 15 Uganda locations
  - Lodging, activities, extras selection per day
  - Auto-generated park fees
  - Vehicle and logistics planning

- ✅ **Pricing Engine**
  - 21 unit tests covering all pricing scenarios
  - Per-person, per-night, fixed pricing models
  - Hierarchical lodging (rooms/seasons/occupancy)
  - Split-room allocations
  - Quantity calculations with capacity limits
  - Manual quantity overrides
  - Pricing adjustments (unexpected, commission, profit)
  - Golden regression tests (5-day Bwindi safari: $6,730)

- ✅ **Pricing Catalog**
  - 143 items (15 parks, 16 lodges, 58 activities, 21 aviation, etc.)
  - Real-time Firestore sync
  - Category filtering (Aviation, Lodging, Vehicle, Activities, Park Fees, Permits, Extras, Logistics)
  - Park-specific and Global items
  - Active/inactive toggle
  - Admin CRUD operations

- ✅ **Admin Panel**
  - Pricing catalog management
  - Add/edit/delete items
  - Hierarchical lodging editor
  - Export pricing catalog IDs (for integration)
  - User management

- ✅ **Lead Management**
  - Create and track leads
  - Status workflow (NEW → CONTACTED → QUALIFIED → PROPOSAL_SENT → WON/LOST)
  - Link leads to quotes
  - Bilingual UI (Hebrew/English)
  - Owner-based access control

- ✅ **PDF Generation**
  - Professional quote PDFs
  - Day-by-day breakdown
  - Pricing details
  - Company branding

- ✅ **Authentication & Security**
  - Firebase Auth (Email/Password)
  - Firestore security rules
  - User-based data isolation
  - Admin role support

- ✅ **Itinerary Integration**
  - API client for Itinerary Builder
  - Create itinerary requests
  - Status polling
  - Preview modal
  - Error handling

#### Technical Infrastructure
- ✅ **CI/CD Pipeline**
  - GitHub Actions
  - Mandatory unit tests (21 tests)
  - Test failures block merges
  - Automated deployment

- ✅ **Caching Strategy**
  - No-cache for HTML/JSON
  - Immutable cache for static assets
  - Prevents stale content issues

- ✅ **Data Export**
  - Export pricing catalog IDs
  - JSON format for integration
  - Includes parks, lodges, activities, etc.

### **What's Incomplete or In Progress**

#### Known Issues
- ⚠️ **Itinerary Builder Integration**
  - Item IDs need to be filled in Admin Panel documents
  - Category mapping between systems needs verification
  - Content documents may not exist for all items

- ⚠️ **Hierarchical Lodging**
  - Complex UI for room/season/occupancy selection
  - Split-room allocations need more testing
  - Edge cases with odd traveler counts

- ⚠️ **Auto-Trip Builder**
  - Exists but needs refinement
  - Tier-based lodge selection
  - Activity recommendations

#### Missing Features
- ❌ **Multi-currency Support**
  - Currently USD only
  - No currency conversion

- ❌ **Email Integration**
  - No automated quote emails
  - Manual PDF download only

- ❌ **Advanced Reporting**
  - No analytics dashboard
  - No revenue tracking

- ❌ **Booking Management**
  - No booking confirmation
  - No payment tracking

- ❌ **Client Portal**
  - No client-facing interface
  - Agent-only system

#### Technical Debt
- 🔧 **ParkCard Deprecation**
  - Old park-based structure still exists
  - Migration to TripDay structure ongoing
  - Backward compatibility maintained

- 🔧 **Type Safety**
  - Some `any` types in metadata fields
  - Lodging config types could be stricter

- 🔧 **Error Handling**
  - Some error messages not user-friendly
  - Need better validation feedback

---

## 🧪 Testing

### Unit Tests (21 tests)
**Location:** `src/utils/__tests__/catalogPricingEngine.test.ts`

**Coverage:**
- ✅ Per-person pricing (3 tests)
- ✅ Per-night pricing (2 tests)
- ✅ Fixed pricing (2 tests)
- ✅ Hierarchical lodging (3 tests)
- ✅ Quantity calculations (3 tests)
- ✅ Edge cases (4 tests)
- ✅ Mixed baskets (2 tests)
- ✅ Golden regression (2 tests)

**Golden Tests:**
1. 5-day Bwindi safari: $6,730 total
2. Single-day hierarchical: $850 total

**Run Tests:**
```bash
npm run test:unit        # Run all tests (no watch)
npm test                 # Run tests in watch mode
```

**CI Enforcement:**
- Tests run on every PR and push to main/develop
- Failing tests block merges
- No bypassing allowed

---

## 🔐 Security & Access Control

### Authentication
- Firebase Auth (Email/Password)
- Anonymous auth supported (limited access)
- User profiles stored in Firestore

### Authorization Levels
1. **Admin**
   - Full access to pricing catalog
   - User management
   - System configuration

2. **User (Agent)**
   - Create/edit own trips
   - View pricing catalog
   - Generate quotes and itineraries
   - Manage own leads

3. **Anonymous**
   - Read-only access (limited)

### Firestore Security Rules
```javascript
// Trips: Owner only
match /trips/{tripId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}

// Pricing Catalog: Read for authenticated, Write for admin
match /pricingCatalog/{itemId} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}

// Leads: Owner only
match /leads/{leadId} {
  allow read, write: if request.auth.uid == resource.data.ownerId;
}

// Users: Own profile only
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

---

## 🌐 Environment Variables

### Required Variables (`.env.local` / `.env.production`)

```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Release Version
REACT_APP_RELEASE_VERSION=1

# Itinerary Builder Integration
REACT_APP_ITINERARY_API_URL=https://europe-west3-da-itinerary-builder.cloudfunctions.net
REACT_APP_ITINERARY_API_KEY=dev_key_12345
REACT_APP_ITINERARY_WEBHOOK_URL=https://discover-africa-quotation-app.web.app/api/webhooks/itinerary
```

---

## 🚀 Deployment

### Build & Deploy
```bash
# Install dependencies
npm install

# Run locally
npm start                # Development server (port 3000)

# Build for production
npm run build            # Creates optimized build/

# Deploy to Firebase
npm run deploy           # Build + Firebase deploy

# Or separately
firebase deploy --only hosting
```

### Production URLs
- **App:** https://discover-africa-quotation-app.web.app
- **Firebase Console:** https://console.firebase.google.com/project/discover-africa-quotation-app

### Cache Strategy
- HTML/JSON: `no-cache, no-store, must-revalidate`
- Static assets: `public, max-age=31536000, immutable`

---

## 📚 Key Algorithms & Business Logic

### 1. **Pricing Calculation Algorithm**

**Location:** `src/utils/catalogPricingEngine.ts`

```typescript
function calculateTripPricing(tripDraft, pricingItems) {
  const lines = [];
  
  // For each trip day
  for (const day of tripDraft.tripDays) {
    // 1. Lodging (per night)
    if (day.lodging) {
      const item = findItem(day.lodging);
      if (item.costType === 'per_night_per_person') {
        lines.push({
          quantity: travelers,
          unitPrice: item.basePrice,
          total: travelers * item.basePrice
        });
      } else if (item.costType === 'hierarchical_lodging') {
        // Complex room/season/occupancy calculation
        lines.push(...calculateHierarchicalLodging(day, travelers));
      }
    }
    
    // 2. Activities (per person or fixed)
    for (const activityId of day.activities) {
      const item = findItem(activityId);
      if (item.costType === 'per_person') {
        lines.push({
          quantity: travelers,
          unitPrice: item.basePrice,
          total: travelers * item.basePrice
        });
      } else if (item.costType === 'fixed_group') {
        lines.push({
          quantity: 1,
          unitPrice: item.basePrice,
          total: item.basePrice
        });
      }
    }
    
    // 3. Park Fees (auto-added, per person)
    if (day.parkId && !day.parkFees?.excluded) {
      const parkFee = findParkFee(day.parkId);
      lines.push({
        quantity: travelers,
        unitPrice: parkFee.basePrice,
        total: travelers * parkFee.basePrice
      });
    }
    
    // 4. Vehicles (per day, capacity-aware)
    if (day.logistics?.vehicle) {
      const vehicle = findItem(day.logistics.vehicle);
      const requiredVehicles = Math.ceil(travelers / vehicle.capacity);
      lines.push({
        quantity: requiredVehicles,
        unitPrice: vehicle.basePrice,
        total: requiredVehicles * vehicle.basePrice
      });
    }
  }
  
  // Apply manual quantity overrides
  for (const line of lines) {
    if (tripDraft.itemQuantities[line.itemId]) {
      line.quantity = tripDraft.itemQuantities[line.itemId];
      line.total = line.quantity * line.unitPrice;
    }
  }
  
  // Calculate subtotal
  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
  
  // Apply adjustments
  const unexpected = subtotal * (tripDraft.unexpectedPercentage / 100);
  const commission = subtotal * (tripDraft.localAgentCommissionPercentage / 100);
  const profit = subtotal * (tripDraft.myProfitPercentage / 100);
  
  const total = subtotal + unexpected + commission + profit;
  
  return {
    lines,
    subtotal,
    adjustments: { unexpected, commission, profit },
    total,
    pricePerPerson: total / travelers
  };
}
```

### 2. **Hierarchical Lodging Calculation**

**Handles:** Rooms, seasons, occupancy, split allocations

```typescript
function calculateHierarchicalLodging(day, travelers) {
  const lines = [];
  
  if (day.lodgingAllocations) {
    // Split-room scenario (e.g., parents + kids)
    for (const allocation of day.lodgingAllocations) {
      const { quantity, guests, price, priceType } = allocation;
      
      if (priceType === 'perRoom') {
        lines.push({
          quantity: quantity,
          unitPrice: price,
          total: quantity * price
        });
      } else if (priceType === 'perPerson') {
        lines.push({
          quantity: guests,
          unitPrice: price,
          total: guests * price
        });
      }
    }
  } else if (day.lodgingConfig) {
    // Single room type for all guests
    const { requiredQuantity, price, priceType } = day.lodgingConfig;
    
    if (priceType === 'perRoom') {
      lines.push({
        quantity: requiredQuantity,
        unitPrice: price,
        total: requiredQuantity * price
      });
    } else if (priceType === 'perPerson') {
      lines.push({
        quantity: travelers,
        unitPrice: price,
        total: travelers * price
      });
    }
  }
  
  return lines;
}
```

### 3. **Item Filtering Logic**

**Location:** `src/utils/pricingCatalogHelpers.ts`

```typescript
function getCatalogItemsForPark(catalog, parkId, category) {
  return catalog.filter(item => {
    // Must be active
    if (!item.active) return false;
    
    // Must match category
    if (item.category !== category) return false;
    
    // Special case: Activities includes Permits
    if (category === 'Activities' && item.category === 'Permits') {
      // Include permits for this park
    }
    
    // Park matching
    if (item.appliesTo === 'Global') {
      return true;  // Global items apply everywhere
    } else {
      return item.parkId === parkId;  // Park-specific items
    }
  });
}
```

---

## 🔗 Integration with Itinerary Builder

### Data Mapping

**Quote App sends:**
```json
{
  "tripId": "trip_123",
  "tripData": {
    "tripDays": [
      {
        "dayNumber": 1,
        "parkId": "BWINDI",
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
    ]
  }
}
```

**Itinerary Builder must:**
1. Match `itemId` to Content Document ID
2. Match `itemName` to Content Document Name
3. Retrieve content (description, images, etc.)
4. Generate formatted itinerary

**Critical Rules:**
- IDs are case-sensitive: `BWINDI` ≠ `bwindi`
- Names must match exactly
- Categories must match: `"Lodging"` not `"lodges"`

**Export File:** `pricing_catalog_ids.json`
- Contains all IDs and names
- Used to populate Admin Panel Content Documents
- Single source of truth for ID mapping

---

## 📖 Documentation Files

1. **README.md** - Architecture overview
2. **TESTING.md** - Testing guide and test documentation
3. **CI_ENFORCEMENT.md** - CI/CD pipeline details
4. **ITINERARY_DATA_MAPPING.md** - Integration specifications
5. **PROJECT_SUMMARY.md** - This document

---

## 🎓 For AI Assistants: Key Concepts

### Understanding the System

1. **Trip Structure Evolution**
   - Old: `ParkCard[]` (park-based)
   - New: `TripDay[]` (day-based)
   - Both supported for backward compatibility

2. **Pricing Philosophy**
   - Catalog-driven (not hardcoded)
   - Real-time Firestore sync
   - Client-side calculations
   - Unit-tested business logic

3. **Item Scoping**
   - Global items: Available everywhere (e.g., domestic flights)
   - Park-specific items: Only for that park (e.g., Bwindi lodges)

4. **Cost Types**
   - Per-person: Scales with travelers
   - Fixed: Same regardless of travelers
   - Per-night: Scales with nights
   - Hierarchical: Complex multi-variable pricing

5. **Quantity Logic**
   - Auto-calculated based on cost type
   - Manual overrides supported
   - Capacity-aware (vehicles, rooms)

6. **Integration Pattern**
   - Quote App = Data source
   - Itinerary Builder = Content generator
   - Item IDs = Bridge between systems

### Common Tasks

**Add a new pricing item:**
1. Go to Admin Panel
2. Click "Add Pricing Item"
3. Fill in: name, category, park, price, cost type
4. Set active = true
5. Save

**Debug pricing calculation:**
1. Check `catalogPricingEngine.test.ts` for similar scenario
2. Add console.logs in `catalogPricingEngine.ts`
3. Verify item quantities and cost types
4. Check manual overrides in `itemQuantities`

**Fix itinerary generation:**
1. Check Item IDs match between systems
2. Verify Content Documents exist in Admin Panel
3. Test API endpoint with Postman
4. Check browser console for errors

**Add a new park:**
1. Add to `src/constants/parks.ts`
2. Add park fees to `pricingCatalog`
3. Add lodges/activities with `parkId`
4. Update Itinerary Builder content

---

## 🐛 Known Issues & Workarounds

### Issue 1: Itinerary Generation Stuck
**Symptom:** "Starting itinerary generation..." never completes  
**Cause:** Blocking alerts prevent UI updates  
**Fix:** Removed blocking alerts (completed)

### Issue 2: Stale Data After Deployment
**Symptom:** Old data shows after new deployment  
**Cause:** Browser caching HTML/JSON  
**Fix:** Added no-cache headers in `firebase.json` (completed)

### Issue 3: Parks Show as 0 in Export
**Symptom:** Export shows "Parks: 0"  
**Cause:** Parks not in pricingCatalog, stored separately  
**Fix:** Export now includes parks from `parks.ts` (completed)

### Issue 4: Item IDs Missing in Admin Panel
**Symptom:** Itinerary can't find content  
**Cause:** Admin Panel documents lack `metadata.itemId`  
**Status:** User needs to fill manually or via script

---

## 📞 Support & Maintenance

### For Developers
- **Primary Language:** TypeScript
- **Code Style:** ESLint (react-app config)
- **Commit Format:** Standard Git commits
- **Branch Strategy:** main (production), feature branches

### For AI Assistants
- **Always check:** Unit tests before modifying pricing logic
- **Never disable:** Golden regression tests
- **Always verify:** Type safety (avoid `any`)
- **Always document:** Breaking changes

### Critical Files (Don't Break!)
1. `src/utils/catalogPricingEngine.ts` - Core pricing logic
2. `src/utils/__tests__/catalogPricingEngine.test.ts` - Test suite
3. `src/types/ui.ts` - Type definitions
4. `firestore.rules` - Security rules
5. `src/constants/parks.ts` - Park data

---

## 🎯 Future Roadmap

### Short-term (Next Sprint)
- [ ] Complete Itinerary Builder integration
- [ ] Fill Item IDs in Admin Panel
- [ ] Add email quote sending
- [ ] Improve error messages

### Medium-term (Next Quarter)
- [ ] Multi-currency support
- [ ] Advanced reporting dashboard
- [ ] Booking management
- [ ] Client portal

### Long-term (Next Year)
- [ ] Mobile app
- [ ] AI-powered trip recommendations
- [ ] Payment processing
- [ ] Multi-language support (beyond Hebrew/English)

---

**End of Document**

*This summary is comprehensive and designed for AI assistants to fully understand the DA Quote App project. It covers architecture, data models, APIs, business logic, current state, and integration patterns.*
