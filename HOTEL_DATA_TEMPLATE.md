# Hotel/Lodge Data Collection Template

## Purpose
This template helps collect comprehensive hotel/lodge information to improve the DA Quote App's recommendation engine and pricing accuracy.

---

## Basic Information

### Hotel Details
- **Name**: _______________________
- **SKU/Code**: _______________________
- **Tier**: ☐ Budget  ☐ Standard  ☐ Luxury  ☐ Ultra-Luxury
- **Active**: ☐ Yes  ☐ No
- **Featured/Recommended**: ☐ Yes  ☐ No

### Location
- **Park**: _______________________
- **Region**: _______________________
- **Inside Park**: ☐ Yes  ☐ No
- **Distance from Park Gate**: _______ km
- **Nearest Airstrip**: _______________________
- **GPS Coordinates**: Lat: _______ Lng: _______

---

## Age Policies

### Age Ranges (as defined by hotel)
- **Infant Age Range**: _____ to _____ years
- **Child Age Range**: _____ to _____ years
- **Minimum Age to Stay**: _____ years (or "No minimum")
- **Adults Only**: ☐ Yes  ☐ No

### Pricing for Children
- **Child Discount Available**: ☐ Yes  ☐ No
  - Age Range: _____ to _____ years
  - Discount: _____% off adult rate
  - Conditions: _______________________

### Infant Policy
- **Infants Stay Free**: ☐ Yes  ☐ No
  - Up to Age: _____ years
  - Conditions: _______________________

---

## Room Configuration

### Maximum Occupancy
- **Max People per Room**: _____
- **Max Adults per Room**: _____
- **Max Children per Room**: _____
- **Do Infants Count Toward Occupancy**: ☐ Yes  ☐ No

### Available Room Types

#### Room Type 1
- **Type**: ☐ Single  ☐ Double  ☐ Twin  ☐ Triple  ☐ Family  ☐ Suite  ☐ Villa
- **Max Occupancy**: _____
- **Max Adults**: _____
- **Max Children**: _____
- **Allows Infants**: ☐ Yes  ☐ No
- **Extra Bed Available**: ☐ Yes  ☐ No
- **Description**: _______________________

#### Room Type 2
- **Type**: ☐ Single  ☐ Double  ☐ Twin  ☐ Triple  ☐ Family  ☐ Suite  ☐ Villa
- **Max Occupancy**: _____
- **Max Adults**: _____
- **Max Children**: _____
- **Allows Infants**: ☐ Yes  ☐ No
- **Extra Bed Available**: ☐ Yes  ☐ No
- **Description**: _______________________

*(Add more room types as needed)*

---

## Pricing

### Base Pricing
- **Base Price**: USD _____ / UGX _____
- **Pricing Model**: 
  - ☐ Per Night Per Person
  - ☐ Per Night Per Room
  - ☐ Per Villa (entire property)

### Seasonal Pricing
- **Low Season Price**: USD _____ (Months: _______)
- **High Season Price**: USD _____ (Months: _______)
- **Peak Season Price**: USD _____ (Months: _______)

### Seasonal Rules
#### Low Season
- **Minimum Nights**: _____ (or "No minimum")
- **Maximum Nights**: _____ (or "No maximum")
- **Advance Booking Required**: _____ days

#### High Season
- **Minimum Nights**: _____ (or "No minimum")
- **Maximum Nights**: _____ (or "No maximum")
- **Advance Booking Required**: _____ days

#### Peak Season
- **Minimum Nights**: _____ (or "No minimum")
- **Maximum Nights**: _____ (or "No maximum")
- **Advance Booking Required**: _____ days

---

## Amenities & Facilities

### Connectivity & Entertainment
- ☐ WiFi
- ☐ TV
- ☐ Phone

### Dining
- ☐ Restaurant
- ☐ Bar
- ☐ Room Service
- ☐ All-Inclusive Option

### Wellness & Recreation
- ☐ Swimming Pool
- ☐ Spa
- ☐ Gym/Fitness Center
- ☐ Massage Services

### Services
- ☐ Laundry Service
- ☐ Concierge
- ☐ Tour Desk
- ☐ Airport/Airstrip Transfer

### Room Features
- ☐ Air Conditioning
- ☐ Heating/Fireplace
- ☐ Private Balcony/Terrace
- ☐ Safety Box
- ☐ Mosquito Nets
- ☐ Mini Bar
- ☐ Tea/Coffee Maker

### Infrastructure
- ☐ Generator/Backup Power
- ☐ Solar Power
- ☐ Water Purification System

### Accessibility
- ☐ Wheelchair Accessible
- ☐ Family Friendly
- ☐ Pet Friendly

### View Type
- ☐ Park View
- ☐ Lake View
- ☐ Mountain View
- ☐ Garden View
- ☐ Forest View

---

## Activities & Experiences

### Activities Available at Lodge
- ☐ Gorilla Trekking (starting point)
- ☐ Chimpanzee Tracking
- ☐ Bird Watching
- ☐ Nature Walks
- ☐ Game Drives
- ☐ Boat Safaris
- ☐ Cultural Visits
- ☐ Community Tours
- ☐ Fishing
- ☐ Other: _______________________

---

## Special Requirements & Notes

### Health & Safety
- ☐ Malaria Prophylaxis Recommended
- ☐ Yellow Fever Certificate Required
- ☐ COVID-19 Vaccination Required
- ☐ Other: _______________________

### Packing Recommendations
- ☐ Warm Clothing (cool evenings)
- ☐ Rain Gear
- ☐ Hiking Boots
- ☐ Binoculars
- ☐ Other: _______________________

---

## Booking Information

### Booking Requirements
- **Minimum Booking Lead Time**: _____ days
- **Cancellation Policy**: _______________________
- **Deposit Required**: _____% 
- **Payment Terms**: _______________________

### Contact Information
- **Reservation Email**: _______________________
- **Reservation Phone**: _______________________
- **Website**: _______________________

---

## Marketing Information

### Description
*(2-3 sentences describing the lodge)*

_______________________
_______________________
_______________________

### Highlights (3-5 key selling points)
1. _______________________
2. _______________________
3. _______________________
4. _______________________
5. _______________________

### Awards/Recognition
_______________________

---

## Additional Notes

### Special Considerations
_______________________
_______________________

### Restrictions or Limitations
_______________________
_______________________

### Best For (type of travelers)
- ☐ Families with Young Children
- ☐ Families with Teens
- ☐ Couples
- ☐ Solo Travelers
- ☐ Groups
- ☐ Honeymooners
- ☐ Adventure Seekers
- ☐ Wildlife Photographers
- ☐ Birders

---

## Data Collected By
- **Name**: _______________________
- **Date**: _______________________
- **Source**: ☐ Hotel Website  ☐ Direct Contact  ☐ Booking Platform  ☐ Other: _______

---

## Example: Clouds Mountain Gorilla Lodge

```json
{
  "name": "Clouds Mountain Gorilla Lodge",
  "sku": "ACC-BWI-CML",
  "tier": "luxury",
  "location": {
    "parkName": "Bwindi Impenetrable National Park",
    "region": "Southwestern Uganda",
    "insidePark": false,
    "distanceFromParkGate": 5
  },
  "regulations": {
    "childAgeRange": { "min": 3, "max": 11 },
    "infantAgeRange": { "min": 0, "max": 2 },
    "minimumAge": 0,
    "maxOccupancyPerRoom": 3,
    "maxAdultsPerRoom": 2,
    "maxChildrenPerRoom": 2,
    "roomTypes": [
      {
        "type": "double",
        "maxOccupancy": 2,
        "maxAdults": 2,
        "maxChildren": 0,
        "allowInfants": true
      },
      {
        "type": "family",
        "maxOccupancy": 4,
        "maxAdults": 2,
        "maxChildren": 2,
        "allowInfants": true
      }
    ],
    "childDiscount": [{
      "ageRange": { "min": 3, "max": 11 },
      "discountPercent": 50,
      "conditions": "When sharing with 2 adults"
    }],
    "infantPolicy": {
      "freeUpToAge": 2,
      "conditions": "When sharing with parents"
    }
  },
  "basePrice": 600,
  "seasonalPricing": {
    "low": 500,
    "high": 600,
    "peak": 700
  }
}
```
