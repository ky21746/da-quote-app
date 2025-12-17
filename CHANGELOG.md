# Changelog

All notable changes to this project will be documented in this file.

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

