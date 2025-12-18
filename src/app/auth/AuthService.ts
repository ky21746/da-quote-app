import { auth } from '../../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  User,
  UserCredential,
} from 'firebase/auth';

export class AuthService {
  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  async signInAnonymously(): Promise<UserCredential> {
    return signInAnonymously(auth);
  }

  async signOut(): Promise<void> {
    return signOut(auth);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  getUserId(): string {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user.uid;
  }
}

export const authService = new AuthService();



