# Changelog

All notable changes to this project will be documented in this file.

## [2024-12-17] - UX Improvements & Architecture Separation

### Added
- Loading states for Pricing Catalog dropdowns in Trip Builder
- Separate `LogisticsSection` component for Logistics page
- Loading spinner in Admin Pricing Catalog table

### Changed
- **Parks Page**: Now shows only Attractions & Parks (Arrival, Lodging, Transport, Activities, Extras)
- **Logistics Page**: Now shows only Logistics fields (Arrival Between Parks, Vehicle & Driver, Internal Movements, Notes)
- Removed Logistics section from `ParkCard` component (moved to dedicated `LogisticsSection`)

### Fixed
- Loading state shows "Loading..." instead of "Not selected" while data loads
- Admin table shows loading spinner instead of "No items found" during initial load
- Trip Builder dropdowns properly display loading state

### Technical
- Created `src/components/Logistics/LogisticsSection.tsx` for dedicated Logistics UI
- Updated `ParkCard` to remove Logistics collapsible section
- Added `isLoading` prop support to `PricingCatalogSelect` and `PricingCatalogMultiSelect`

## [2024-12-17] - Firestore Connection Fix
### Fixed
- Created Firestore database (was missing entirely)
- Verified read/write connection working
- PricingCatalogContext using onSnapshot correctly
- Admin and Trip Builder share same data source

### Technical
- Collection: `pricingCatalog`
- Rules: Open until 2026-01-16
- No emulator - direct production connection

