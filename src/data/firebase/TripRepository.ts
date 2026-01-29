import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TripRepository as ITripRepository } from '../../core/domain/repositories';
import { Trip } from '../../core/domain/entities';
import { TripMapper } from '../../core/mappers';

export class FirebaseTripRepository implements ITripRepository {
  private readonly collectionName = 'trips';

  async getById(tripId: string, userId: string): Promise<Trip | null> {
    const docRef = doc(db, this.collectionName, tripId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    if (data.userId !== userId) {
      throw new Error('Unauthorized: Trip does not belong to user');
    }

    return TripMapper.fromFirestore({ id: docSnap.id, ...data });
  }

  async save(trip: Trip): Promise<Trip> {
    const firestoreData = TripMapper.toFirestore(trip);
    const docRef = doc(db, this.collectionName, trip.id);
    await setDoc(docRef, firestoreData);
    return trip;
  }

  async update(
    tripId: string,
    userId: string,
    updates: Partial<Trip>
  ): Promise<Trip> {
    const existingTrip = await this.getById(tripId, userId);
    if (!existingTrip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    const updatedTrip: Trip = {
      ...existingTrip,
      ...updates,
      updatedAt: new Date(),
    };

    const firestoreData = TripMapper.toFirestore(updatedTrip);
    const docRef = doc(db, this.collectionName, tripId);
    await updateDoc(docRef, firestoreData as any);

    return updatedTrip;
  }

  async listByUser(userId: string): Promise<Trip[]> {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) =>
      TripMapper.fromFirestore({ id: docSnap.id, ...docSnap.data() })
    );
  }
}






