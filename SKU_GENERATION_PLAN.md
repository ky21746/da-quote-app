# SKU Generation Plan for Pricing Catalog

**Date:** February 6, 2026  
**Status:** Planning Phase  
**Goal:** Assign unique, human-readable SKUs to all 143+ items in pricingCatalog

---

## 🔍 Current State (From Firebase Console)

### Observed Issues:
1. ✅ **Document IDs:** Auto-generated (20-character alphanumeric) - e.g., `kPaFqp5I7Uzij7XccdzD`
2. ❌ **SKU Field:** `null` for most/all items
3. ✅ **Data Structure:** Complete with parkId, category, itemName, basePrice, costType

### Example Document:
```json
{
  "documentId": "kPaFqp5I7Uzij7XccdzD",
  "active": true,
  "appliesTo": "Park",
  "basePrice": 6,
  "category": "Activities",
  "costType": "per_person",
  "itemName": "Swimming - Adult",
  "notes": null,
  "parkId": "BUSIKA",
  "sku": null  // ⚠️ MISSING
}
```

---

## 🎯 SKU Format Specification

### Format Pattern:
```
{PARK_CODE}_{CATEGORY_CODE}_{ITEM_CODE}_{SEQUENCE}
```

### Park Codes (3-4 letters):
- MURCHISON → `MURCH`
- BWINDI → `BWIND`
- QUEEN_ELIZABETH → `QELIZ`
- KIBALE → `KIBAL`
- MGAHINGA → `MGAHI`
- KIDEPO → `KIDEP`
- LAKE_MBURO → `LMBUR`
- MT_ELGON → `MELGO`
- RWENZORI → `RWENZ`
- SEMULIKI → `SEMUL`
- ZIWA → `ZIWA`
- BUSIKA → `BUSIK`
- ENTEBBE → `ENTEB`
- LAKE_BUNYONYI → `LBUNY`
- JINJA → `JINJA`
- **Global Items** → `GLOBL`

### Category Codes:
- Aviation → `AVI`
- Lodging → `LODG`
- Vehicle → `VEH`
- Activities → `ACT`
- Park Fees → `PFEE`
- Permits → `PERM`
- Extras → `EXTR`
- Logistics → `LOG`

### Item Code:
- First 8 characters of itemName (uppercase, no spaces/special chars)
- Examples:
  - "Swimming - Adult" → `SWIMMING`
  - "Gorilla Trekking Permit" → `GORILLAT`
  - "Clouds Mountain Gorilla Lodge" → `CLOUDSMO`

### Sequence Number:
- 3-digit zero-padded number: `001`, `002`, `003`, etc.
- Increments per unique combination of Park + Category

---

## 📋 SKU Examples

| Park | Category | Item Name | Generated SKU |
|------|----------|-----------|---------------|
| BUSIKA | Activities | Swimming - Adult | `BUSIK_ACT_SWIMMING_001` |
| BWINDI | Lodging | Clouds Mountain Gorilla Lodge | `BWIND_LODG_CLOUDSMO_001` |
| MURCHISON | Activities | Game Drive – Day | `MURCH_ACT_GAMEDRI_001` |
| MURCHISON | Park Fees | Murchison Park Entry Fee | `MURCH_PFEE_MURCHISO_001` |
| Global | Aviation | Domestic Flight Entebbe-Kihihi | `GLOBL_AVI_DOMESTIC_001` |

---

## 🛠️ Implementation Steps

### Step 1: Audit Current Catalog
```bash
cd "/Users/yuval/Documents/Bolt New ai/DA Quote App Antigravity"
node scripts/auditCatalog.mjs
```

**Output:** `catalog_audit.json` with:
- Total items count
- Items missing SKUs
- Category breakdown
- Full item list with document IDs

### Step 2: Generate SKUs
Create script: `scripts/generateSKUs.mjs`

**Logic:**
1. Fetch all documents from `pricingCatalog`
2. Group by `parkId` + `category`
3. For each item:
   - Generate SKU using format above
   - Check for duplicates
   - Assign sequence number
4. Output: `sku_assignments.json`

### Step 3: Review & Validate
- Manual review of `sku_assignments.json`
- Check for:
  - Duplicate SKUs
  - Naming conflicts
  - Special cases (hierarchical lodging, etc.)

### Step 4: Update Firestore
Create script: `scripts/updateSKUs.mjs`

**Logic:**
1. Read `sku_assignments.json`
2. For each item:
   - Update Firestore document with new SKU
   - Log success/failure
3. Output: Update summary

### Step 5: Verify
- Re-run audit script
- Confirm all items have SKUs
- Export final catalog with SKUs

---

## 🔗 Integration with Itinerary Builder

### Data Mapping:
Once SKUs are assigned, they will serve as the **bridge** between:
- **Quote App** (this system) - Uses SKU to identify items
- **Itinerary Builder** - Uses SKU to match content documents

### Export Format:
```json
{
  "sku": "BWIND_ACT_GORILLAT_001",
  "documentId": "kPaFqp5I7Uzij7XccdzD",
  "itemName": "Gorilla Trekking Permit",
  "category": "Activities",
  "parkId": "BWINDI"
}
```

---

## ⚠️ Special Cases

### 1. Hierarchical Lodging
Items with `metadata` field containing room types, seasons, occupancy:
- **SKU:** Same as base item
- **Example:** `BWIND_LODG_CLOUDSMO_001`
- **Note:** Metadata variations don't get separate SKUs

### 2. Global Items
Items with `parkId: null` or `appliesTo: "Global"`:
- **Park Code:** `GLOBL`
- **Example:** `GLOBL_AVI_DOMESTIC_001`

### 3. Duplicate Names
If two items have identical names in same park + category:
- **Solution:** Add distinguishing suffix to item code
- **Example:** 
  - "Game Drive" → `GAMEDRI_001`
  - "Game Drive (Night)" → `GAMEDRIN_001`

---

## 📊 Expected Results

### Before:
- **Total Items:** ~143
- **Items with SKU:** 0
- **Items missing SKU:** 143

### After:
- **Total Items:** ~143
- **Items with SKU:** 143
- **Items missing SKU:** 0
- **Unique SKUs:** 143

---

## 🚀 Next Actions

1. **Run Audit Script** (requires Firebase authentication)
   ```bash
   node scripts/auditCatalog.mjs
   ```

2. **Review audit results** in `catalog_audit.json`

3. **Create SKU generation script** based on this plan

4. **Generate SKUs** and review assignments

5. **Update Firestore** with new SKUs

6. **Export final catalog** for Itinerary Builder integration

---

## 📝 Notes

- SKUs are **immutable** once assigned (don't change them)
- SKUs must be **unique** across entire catalog
- SKUs should be **human-readable** for debugging
- SKUs will be used in **API requests** to Itinerary Builder
- Keep a **backup** of Firestore before bulk updates

---

**Status:** Ready to proceed with Step 1 (Audit)
