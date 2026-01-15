import { collection, getDocs, getDoc, updateDoc, deleteDoc, doc, query, orderBy, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TripDraft, CalculationResult } from '../types/ui';

export interface SavedQuote {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  referenceNumber?: number;
  sourceQuoteId?: string;
  tripName: string;
  travelers: number;
  days: number;
  tier: string;
  draft: TripDraft;
  calculation?: CalculationResult;
  grandTotal?: number;
  pricePerPerson?: number;
}

function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(item => removeUndefined(item));
  if (obj instanceof Date) return obj;
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        cleaned[key] = removeUndefined(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
}

export const quoteService = {
  async saveQuote(draft: TripDraft, calculation: CalculationResult): Promise<{ id: string; referenceNumber: number }> {
    const cleanDraft = removeUndefined(draft);
    const cleanCalculation = removeUndefined(calculation);
    
    // Parse totals from strings (e.g., "USD 1234.56" -> 1234.56)
    const parseAmount = (amount: string): number => {
      const numeric = amount.replace(/[^0-9.]/g, '');
      return parseFloat(numeric) || 0;
    };
    
    const quoteData = {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'draft',
      tripName: cleanDraft?.name || 'Untitled Trip',
      travelers: cleanDraft?.travelers || 1,
      days: cleanDraft?.days || 1,
      tier: cleanDraft?.tier || 'base',
      draft: cleanDraft || {},
      calculation: cleanCalculation || {},
      grandTotal: parseAmount(calculation.total),
      pricePerPerson: parseAmount(calculation.pricePerPerson),
    };

    const quoteRef = doc(collection(db, 'quotes'));
    const counterRef = doc(db, 'meta', 'proposalCounter');

    const referenceNumber = await runTransaction(db, async (tx) => {
      const counterSnap = await tx.get(counterRef);
      const current = (counterSnap.data() as any)?.current ?? 217000;
      const next = current + 1;

      if (counterSnap.exists()) {
        tx.update(counterRef, { current: next });
      } else {
        tx.set(counterRef, { current: next });
      }

      tx.set(quoteRef, {
        ...quoteData,
        referenceNumber: next,
      });

      return next;
    });

    return { id: quoteRef.id, referenceNumber };
  },

  async saveFinalQuote(
    draft: TripDraft,
    calculation: CalculationResult,
    sourceQuoteId?: string
  ): Promise<{ id: string; referenceNumber: number }> {
    const cleanDraft = removeUndefined(draft);
    const cleanCalculation = removeUndefined(calculation);

    const parseAmount = (amount: string): number => {
      const numeric = amount.replace(/[^0-9.]/g, '');
      return parseFloat(numeric) || 0;
    };

    const quoteData = removeUndefined({
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'sent',
      sourceQuoteId,
      tripName: cleanDraft?.name || 'Untitled Trip',
      travelers: cleanDraft?.travelers || 1,
      days: cleanDraft?.days || 1,
      tier: cleanDraft?.tier || 'base',
      draft: cleanDraft || {},
      calculation: cleanCalculation || {},
      grandTotal: parseAmount(calculation.total),
      pricePerPerson: parseAmount(calculation.pricePerPerson),
    });

    const quoteRef = doc(collection(db, 'quotes'));
    const counterRef = doc(db, 'meta', 'proposalCounter');

    const referenceNumber = await runTransaction(db, async (tx) => {
      const counterSnap = await tx.get(counterRef);
      const current = (counterSnap.data() as any)?.current ?? 217000;
      const next = current + 1;

      if (counterSnap.exists()) {
        tx.update(counterRef, { current: next });
      } else {
        tx.set(counterRef, { current: next });
      }

      tx.set(quoteRef, {
        ...quoteData,
        referenceNumber: next,
      });

      return next;
    });

    return { id: quoteRef.id, referenceNumber };
  },

  async saveDraft(draft: TripDraft): Promise<string> {
    const cleanDraft = removeUndefined(draft);

    const draftData = {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'draft',
      tripName: cleanDraft?.name || 'Untitled Trip',
      travelers: cleanDraft?.travelers || 1,
      days: cleanDraft?.days || 1,
      tier: cleanDraft?.tier || 'base',
      draft: cleanDraft || {},
    };

    const quoteRef = doc(collection(db, 'quotes'));
    await runTransaction(db, async (tx) => {
      tx.set(quoteRef, draftData);
    });
    return quoteRef.id;
  },

  async updateDraft(id: string, draft: TripDraft): Promise<void> {
    const cleanDraft = removeUndefined(draft);
    await updateDoc(doc(db, 'quotes', id), {
      updatedAt: serverTimestamp(),
      status: 'draft',
      tripName: cleanDraft?.name || 'Untitled Trip',
      travelers: cleanDraft?.travelers || 1,
      days: cleanDraft?.days || 1,
      tier: cleanDraft?.tier || 'base',
      draft: cleanDraft || {},
    });
  },

  async getQuotes(): Promise<SavedQuote[]> {
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date(), updatedAt: d.data().updatedAt?.toDate?.() || new Date() })) as SavedQuote[];
  },

  async getFinalQuotes(): Promise<SavedQuote[]> {
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
      updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
    })) as SavedQuote[];
    return all.filter((q) => q.status === 'sent');
  },

  async getQuote(id: string): Promise<SavedQuote | null> {
    const docSnap = await getDoc(doc(db, 'quotes', id));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data(), createdAt: docSnap.data().createdAt?.toDate?.() || new Date(), updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date() } as SavedQuote;
  },

  async updateStatus(id: string, status: SavedQuote['status']): Promise<void> {
    await updateDoc(doc(db, 'quotes', id), { status, updatedAt: serverTimestamp() });
  },

  async deleteQuote(id: string): Promise<void> {
    await deleteDoc(doc(db, 'quotes', id));
  }
};
