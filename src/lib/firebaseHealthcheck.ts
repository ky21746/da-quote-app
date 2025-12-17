import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Health check function to verify Firestore connection
 * This performs a simple read operation to ensure the database is accessible
 * 
 * @returns Promise<boolean> - true if connection is successful, false otherwise
 */
export async function pingFirestore(): Promise<boolean> {
  try {
    // Attempt to read a dummy document
    // This will fail gracefully if there's a connection issue
    const dummyRef = doc(db, '_healthcheck', 'ping');
    await getDoc(dummyRef);
    return true;
  } catch (error) {
    console.error('Firestore health check failed:', error);
    return false;
  }
}

