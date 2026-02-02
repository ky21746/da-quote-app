import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Lead } from '../types/leads';
import { TripDraft } from '../types/ui';
import { quoteService } from './quoteService';

export const leadService = {
  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'ownerId'>): Promise<string> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be authenticated to create lead');
    }

    const lead = {
      ...leadData,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'leads'), lead);
    return docRef.id;
  },

  async updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'ownerId' | 'createdAt'>>): Promise<void> {
    const leadRef = doc(db, 'leads', id);
    await updateDoc(leadRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    } as any);
  },

  async getLead(id: string): Promise<Lead | null> {
    const docSnap = await getDoc(doc(db, 'leads', id));
    if (!docSnap.exists()) return null;
    
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
      lastActivityAt: docSnap.data().lastActivityAt?.toDate?.() || new Date(),
    } as Lead;
  },

  async getLeads(): Promise<Lead[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be authenticated to get leads');
    }

    const q = query(
      collection(db, 'leads'),
      where('ownerId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
      updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
      lastActivityAt: d.data().lastActivityAt?.toDate?.() || new Date(),
    })) as Lead[];
  },

  async deleteLead(id: string): Promise<void> {
    await deleteDoc(doc(db, 'leads', id));
  },

  async createQuoteFromLead(lead: Lead): Promise<{ quoteId: string }> {
    // Create minimal TripDraft
    const draft: TripDraft = {
      name: `${lead.firstName} ${lead.lastName}`,
      travelers: 2,
      days: 5,
      tier: 'standard',
      tripDays: [],
    };

    // Save draft with leadId
    const quoteId = await quoteService.saveDraft(draft, lead.id);

    // Update lead status to PROPOSAL_SENT
    await this.updateLead(lead.id, {
      status: 'PROPOSAL_SENT',
    });

    return { quoteId };
  },
};
