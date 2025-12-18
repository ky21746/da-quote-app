import { collection, addDoc, getDocs, getDoc, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TripDraft, CalculationResult } from '../types/ui';

export interface SavedQuote {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  tripName: string;
  travelers: number;
  days: number;
  tier: string;
  draft: TripDraft;
  calculation: CalculationResult;
  grandTotal: number;
  pricePerPerson: number;
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
  async saveQuote(draft: TripDraft, calculation: CalculationResult): Promise<string> {
    const cleanDraft = removeUndefined(draft);
    const cleanCalculation = removeUndefined(calculation);
    
    // Parse totals from strings (e.g., "USD 1234.56" -> 1234.56)
    const parseAmount = (amount: string): number => {
      const numeric = amount.replace(/[^0-9.]/g, '');
      return parseFloat(numeric) || 0;
    };
    
    const quoteData = {
      createdAt: new Date(),
      updatedAt: new Date(),
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
    const docRef = await addDoc(collection(db, 'quotes'), quoteData);
    return docRef.id;
  },

  async getQuotes(): Promise<SavedQuote[]> {
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date(), updatedAt: d.data().updatedAt?.toDate?.() || new Date() })) as SavedQuote[];
  },

  async getQuote(id: string): Promise<SavedQuote | null> {
    const docSnap = await getDoc(doc(db, 'quotes', id));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data(), createdAt: docSnap.data().createdAt?.toDate?.() || new Date(), updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date() } as SavedQuote;
  },

  async updateStatus(id: string, status: SavedQuote['status']): Promise<void> {
    await updateDoc(doc(db, 'quotes', id), { status, updatedAt: new Date() });
  }
};
