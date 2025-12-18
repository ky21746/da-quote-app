import { collection, doc, getDoc, setDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { CalculationRepository as ICalculationRepository } from '../../core/domain/repositories';
import { Calculation } from '../../core/domain/entities';
import { CalculationMapper } from '../../core/mappers';

export class FirebaseCalculationRepository implements ICalculationRepository {
  private readonly collectionName = 'calculations';

  async save(calculation: Calculation): Promise<Calculation> {
    const firestoreData = CalculationMapper.toFirestore(calculation);
    const docRef = doc(db, this.collectionName, calculation.id);
    await setDoc(docRef, firestoreData);
    return calculation;
  }

  async getByTripId(tripId: string): Promise<Calculation | null> {
    const q = query(
      collection(db, this.collectionName),
      where('tripId', '==', tripId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return CalculationMapper.fromFirestore({ id: snapshot.docs[0].id, ...data });
  }

  async getById(calculationId: string): Promise<Calculation | null> {
    const docRef = doc(db, this.collectionName, calculationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return CalculationMapper.fromFirestore({ id: docSnap.id, ...docSnap.data() });
  }
}


