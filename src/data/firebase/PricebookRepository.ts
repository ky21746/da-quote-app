import { collection, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PricebookRepository as IPricebookRepository } from '../../core/domain/repositories';
import { Pricebook } from '../../core/domain/entities';
import { PricebookMapper } from '../../core/mappers';
import { PricebookVersion } from '../../core/domain/enums';

export class FirebasePricebookRepository implements IPricebookRepository {
  private readonly collectionName = 'pricebooks';

  async getCurrent(): Promise<Pricebook> {
    const q = query(
      collection(db, this.collectionName),
      where('version', '==', PricebookVersion.CURRENT),
      orderBy('effectiveFrom', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      throw new Error('No current pricebook found');
    }

    const data = snapshot.docs[0].data();
    return PricebookMapper.fromFirestore({ id: snapshot.docs[0].id, ...data });
  }

  async getById(id: string): Promise<Pricebook | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return PricebookMapper.fromFirestore({ id: docSnap.id, ...docSnap.data() });
  }

  async getByVersion(version: string): Promise<Pricebook | null> {
    const q = query(
      collection(db, this.collectionName),
      where('version', '==', version),
      orderBy('effectiveFrom', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return PricebookMapper.fromFirestore({ id: snapshot.docs[0].id, ...data });
  }
}


