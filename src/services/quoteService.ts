import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TripDraft, CalculationResult } from '../types/ui';

export interface SavedQuote {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  
  // Trip info
  tripName: string;
  travelers: number;
  days: number;
  tier: string;
  
  // Selections
  draft: TripDraft;
  
  // Calculation
  calculation: CalculationResult;
  
  // Totals (for quick display in list)
  grandTotal: number;
  pricePerPerson: number;
}

export const quoteService = {
  // Save new quote
  async saveQuote(draft: TripDraft, calculation: CalculationResult): Promise<string> {
    // Parse totals from strings (e.g., "USD 1234.56" -> 1234.56)
    const parseAmount = (amount: string): number => {
      const numeric = amount.replace(/[^0-9.]/g, '');
      return parseFloat(numeric) || 0;
    };

    const quote: Omit<SavedQuote, 'id'> = {
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      tripName: draft.name || 'Untitled Trip',
      travelers: draft.travelers || 1,
      days: draft.days || 1,
      tier: draft.tier || 'base',
      draft,
      calculation,
      grandTotal: parseAmount(calculation.total),
      pricePerPerson: parseAmount(calculation.pricePerPerson),
    };
    
    const docRef = await addDoc(collection(db, 'quotes'), {
      ...quote,
      createdAt: Timestamp.fromDate(quote.createdAt),
      updatedAt: Timestamp.fromDate(quote.updatedAt),
    });
    console.log('✅ Quote saved:', docRef.id);
    return docRef.id;
  },
  
  // Get all quotes
  async getQuotes(): Promise<SavedQuote[]> {
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as SavedQuote[];
  },
  
  // Get single quote
  async getQuote(id: string): Promise<SavedQuote | null> {
    const docRef = doc(db, 'quotes', id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as SavedQuote;
  },
  
  // Update quote status
  async updateStatus(id: string, status: SavedQuote['status']): Promise<void> {
    const docRef = doc(db, 'quotes', id);
    await updateDoc(docRef, { 
      status, 
      updatedAt: Timestamp.fromDate(new Date()) 
    });
  }
};

