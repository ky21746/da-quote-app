import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

function safeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function inferCapacityFromName(itemName: string): number | null {
  const name = itemName.toLowerCase();

  // Explicit patterns
  const upToMatch = name.match(/up\s*to\s*(\d+)\s*seats?/i);
  if (upToMatch) return Number(upToMatch[1]);

  const rangeMatch = name.match(/(\d+)\s*[–-]\s*(\d+)\s*seats?/i);
  if (rangeMatch) return Number(rangeMatch[2]);

  // Known aircraft/vehicle models used in existing seed data
  if (name.includes('bell 412')) return 13;
  if (name.includes('d1900')) return 19;

  return null;
}

function isPhysicalLimitCandidate(data: any): boolean {
  const category = String(data.category || '');
  const costType = String(data.costType || '');
  if (!['Aviation', 'Vehicle', 'Logistics'].includes(category)) return false;
  if (!['fixed_group', 'fixed_per_day'].includes(costType)) return false;

  const itemName = String(data.itemName || '').toLowerCase();
  return (
    itemName.includes('vehicle') ||
    itemName.includes('safari vehicle') ||
    itemName.includes('4x4') ||
    itemName.includes('van') ||
    itemName.includes('overlander') ||
    itemName.includes('bus') ||
    itemName.includes('boat') ||
    itemName.includes('aircraft') ||
    itemName.includes('helicopter') ||
    itemName.includes('fixed wing') ||
    itemName.includes('seats') ||
    itemName.includes('charter')
  );
}

/**
 * Safe migration:
 * - quantity: if missing/invalid -> set to 1
 * - capacity: ONLY set when we can infer a real numeric value for relevant physical-limit items
 */
export async function migrateCapacityQuantity(): Promise<{
  updatedQuantity: number;
  updatedCapacity: number;
  skipped: number;
  errors: Array<{ id: string; error: string }>;
}> {
  const results = {
    updatedQuantity: 0,
    updatedCapacity: 0,
    skipped: 0,
    errors: [] as Array<{ id: string; error: string }>,
  };

  const pricingCatalogRef = collection(db, 'pricingCatalog');
  const snapshot = await getDocs(pricingCatalogRef);

  for (const d of snapshot.docs) {
    try {
      const data = d.data() as any;
      const updates: Record<string, any> = {};

      const currentQuantity = safeNumber(data.quantity);
      if (!currentQuantity || currentQuantity <= 0) {
        updates.quantity = 1;
      }

      const currentCapacity = safeNumber(data.capacity);
      if (!currentCapacity && isPhysicalLimitCandidate(data)) {
        const inferred = inferCapacityFromName(String(data.itemName || ''));
        if (inferred && inferred > 0) {
          updates.capacity = inferred;
        }
      }

      if (Object.keys(updates).length === 0) {
        results.skipped++;
        continue;
      }

      await updateDoc(doc(db, 'pricingCatalog', d.id), updates as any);

      if ('quantity' in updates) results.updatedQuantity++;
      if ('capacity' in updates) results.updatedCapacity++;
    } catch (e) {
      results.errors.push({
        id: d.id,
        error: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }

  return results;
}

export async function runMigration(): Promise<void> {
  console.log('🚀 Starting capacity/quantity migration...');
  const res = await migrateCapacityQuantity();
  console.log('✅ Migration complete');
  console.log(res);
}
