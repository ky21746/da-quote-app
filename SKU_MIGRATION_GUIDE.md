# SKU Migration Guide

## Overview
This guide walks you through applying the SKU migration to your `pricingCatalog` Firestore collection. The migration will:
- Assign standardized SKUs to all 128 existing items
- Delete the invalid "main" document
- Enable auto-SKU generation for new items
- Set up webhook notifications to the Itinerary Builder

---

## ⚠️ IMPORTANT: Pre-Migration Steps

### 1. Backup Your Data
Before running the migration, **export your current catalog**:

```bash
# Option 1: Use the app
1. Run: npm start
2. Go to Admin > Pricing Catalog
3. Click "Export Catalog" button
4. Save the CSV file as backup

# Option 2: Export from Firebase Console
1. Go to Firebase Console > Firestore Database
2. Select pricingCatalog collection
3. Export to JSON
```

### 2. Review the Migration File
Open `sku_migration.json` and verify:
- ✅ All SKUs follow the format: `[PARK]_[CATEGORY]_[SHORTNAME]`
- ✅ No duplicate SKUs
- ✅ SKUs are human-readable and make sense
- ✅ The "main" document is marked for deletion

**Example SKUs:**
```
MURCHISON_ACT_BOAT_CRUISE     ← Activity in Murchison
BWINDI_LODGE_CLOUDS           ← Lodge in Bwindi
GLOBAL_AVN_PC12_EBB_BUB       ← Aviation route
BUSIKA_ACT_QUAD_20MIN         ← Activity with duration
```

---

## 🧪 Step 1: Test Migration (2-3 Items)

Before running the full migration, test with a few items:

### Create a Test Migration File

Create `sku_migration_test.json` with just 2-3 items:

```json
[
  {
    "documentId": "BBugKCWUwSavFXj6VKai",
    "itemName": "RZR full day trip",
    "category": "Activities",
    "parkId": "GLOBAL",
    "oldSku": "RZR-FUL-DAY",
    "newSku": "GLOBAL_ACT_RZR_FULL_DAY",
    "action": "UPDATE"
  },
  {
    "documentId": "EfTs4PQDkg817PrSaQEI",
    "itemName": "Boat Safari / Launch Cruise",
    "category": "Activities",
    "parkId": "MURCHISON",
    "oldSku": "ACT-BOAT-CRUISE",
    "newSku": "MURCHISON_ACT_BOAT_CRUISE",
    "action": "UPDATE"
  }
]
```

### Modify the Script Temporarily

Edit `scripts/applySkuMigration.mjs` line 42:

```javascript
// Change this:
const migrationPath = path.join(__dirname, '..', 'sku_migration.json');

// To this (temporarily):
const migrationPath = path.join(__dirname, '..', 'sku_migration_test.json');
```

### Run Test Migration

```bash
node scripts/applySkuMigration.mjs
```

**Expected output:**
```
📖 Reading SKU migration plan...
📊 Found 2 items to update
⚠️  WARNING: This will update Firestore documents.
   Press Ctrl+C to cancel, or wait 5 seconds to continue...

🚀 Starting migration...

✅ BBugKCWUwSavFXj6VKai → GLOBAL_ACT_RZR_FULL_DAY
✅ EfTs4PQDkg817PrSaQEI → MURCHISON_ACT_BOAT_CRUISE

═══════════════════════════════════════════════════════════
              MIGRATION COMPLETE
═══════════════════════════════════════════════════════════

✅ Successfully Updated:  2
🗑️  Deleted:              0
❌ Failed:                0
```

### Verify in Firebase Console

1. Go to Firebase Console > Firestore > pricingCatalog
2. Find the two test items
3. Verify the `sku` field is updated correctly

### Rollback Test (if needed)

If something went wrong, restore from your backup or manually revert the SKUs in Firebase Console.

---

## 🚀 Step 2: Full Migration

Once the test is successful:

### 1. Restore the Script

Edit `scripts/applySkuMigration.mjs` line 42 back to:

```javascript
const migrationPath = path.join(__dirname, '..', 'sku_migration.json');
```

### 2. Run Full Migration

```bash
node scripts/applySkuMigration.mjs
```

**Expected output:**
```
📖 Reading SKU migration plan...
📊 Found 129 items to update
⚠️  WARNING: This will update Firestore documents.
   Press Ctrl+C to cancel, or wait 5 seconds to continue...

🚀 Starting migration...

🗑️  Deleted "main" document
✅ BBugKCWUwSavFXj6VKai → GLOBAL_ACT_RZR_FULL_DAY
✅ OcYJMKNVYDxFeGCWeqhI → BUSIKA_ACT_ARCHERY_5RND
... (128 more updates)

═══════════════════════════════════════════════════════════
              MIGRATION COMPLETE
═══════════════════════════════════════════════════════════

✅ Successfully Updated:  128
🗑️  Deleted:              1
❌ Failed:                0

📄 Results saved to: sku_migration_results.json
```

### 3. Verify Results

Check `sku_migration_results.json` for the complete summary.

### 4. Spot-Check in Firebase Console

Verify a few random items have correct SKUs:
- Check different categories (Activities, Lodging, Aviation, etc.)
- Check different parks (MURCHISON, BWINDI, BUSIKA, etc.)
- Check GLOBAL items

---

## ✅ Step 3: Verify Auto-SKU Generation

Test that new items automatically get SKUs:

### 1. Start the App

```bash
npm start
```

### 2. Add a New Item

1. Go to Admin > Pricing Catalog
2. Click "Add New Item"
3. Fill in:
   - **Applies To:** Park
   - **Park:** Murchison
   - **Category:** Activities
   - **Item Name:** Test Bird Watching Tour
   - **Base Price:** 50
   - **Cost Type:** Per Person

4. **Watch the SKU field auto-populate:**
   - Should show: `MURCHISON_ACT_TEST_BIRD_WATCHING`

5. Click "Add Item"

### 3. Verify in Firebase

Check that the new item has the auto-generated SKU in Firestore.

### 4. Delete Test Item

Delete the test item from the catalog.

---

## 🔔 Step 4: Verify Webhook Integration

Check that the Itinerary Builder is being notified:

### 1. Check Browser Console

When you add or update an item, you should see:
```
✅ Itinerary Builder notified: MURCHISON_ACT_TEST_BIRD_WATCHING
```

### 2. Check Network Tab

1. Open DevTools > Network tab
2. Add or update an item
3. Look for a POST request to:
   ```
   https://europe-west3-da-itinerary-builder.cloudfunctions.net/onNewCatalogItem
   ```
4. Verify the payload includes:
   ```json
   {
     "sku": "MURCHISON_ACT_...",
     "itemName": "...",
     "category": "Activities",
     "parkId": "MURCHISON",
     "basePrice": 50,
     "costType": "per_person"
   }
   ```

### 3. Webhook Errors

If the webhook fails:
- Check that `REACT_APP_ITINERARY_API_KEY` is set in `.env.local`
- Check browser console for error messages
- **Note:** Webhook failures don't block item creation (fire-and-forget)

---

## 📋 Post-Migration Checklist

- [ ] All 128 items have SKUs in Firestore
- [ ] "main" document is deleted
- [ ] No duplicate SKUs exist
- [ ] New items auto-generate SKUs
- [ ] SKU field is read-only in the Add Item form
- [ ] Webhook notifications are working
- [ ] Backup file is saved safely
- [ ] `sku_migration_results.json` shows 0 failures

---

## 🐛 Troubleshooting

### Error: "Could not load the default credentials"

**Solution:** The script uses Firebase Client SDK (not Admin SDK), so it reads from `.env.local`. Make sure:
```bash
# .env.local should have:
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=discover-africa-quotation-app
# ... etc
```

### Error: "Document not found"

Some items may have been deleted. Check `sku_migration_results.json` for the list of failed items.

### Duplicate SKUs

If you see duplicate SKUs, the `ensureUniqueSku` function will append `_2`, `_3`, etc. Check the results file.

### Webhook Not Working

1. Check `.env.local` has `REACT_APP_ITINERARY_API_KEY`
2. Check browser console for CORS or network errors
3. Verify the Itinerary Builder endpoint is accessible

---

## 🔄 Rollback Plan

If you need to rollback:

### Option 1: Restore from Backup

1. Go to Firebase Console > Firestore
2. Delete all items in `pricingCatalog`
3. Import from your backup CSV/JSON

### Option 2: Manual Revert

Use the `sku_migration.json` file to manually revert SKUs:
- For each item, set `sku` back to `oldSku` value
- Restore the "main" document if needed

---

## 📞 Support

If you encounter issues:
1. Check `sku_migration_results.json` for error details
2. Review browser console logs
3. Check Firebase Console for data integrity
4. Verify `.env.local` configuration

---

## ✨ What's Next?

After successful migration:
1. **Test the Quote App** - Ensure pricing calculations still work
2. **Test Itinerary Builder Integration** - Verify SKUs are recognized
3. **Monitor New Items** - Ensure auto-SKU generation works consistently
4. **Update Documentation** - Document the new SKU convention for your team
