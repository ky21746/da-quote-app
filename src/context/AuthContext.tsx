import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type UserRole = 'admin' | 'user';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const checkIfEmailAllowed = async (email: string): Promise<boolean> => {
    try {
      const allowedEmailsRef = doc(db, 'settings', 'allowedEmails');
      const allowedEmailsDoc = await getDoc(allowedEmailsRef);
      
      if (!allowedEmailsDoc.exists()) {
        return false;
      }
      
      const allowedEmails = allowedEmailsDoc.data()?.emails || [];
      return allowedEmails.includes(email);
    } catch (error) {
      console.error('Error checking allowed emails:', error);
      return false;
    }
  };

  const fetchUserProfile = async (user: User): Promise<UserProfile | null> => {
    try {
      const userEmail = user.email || '';
      
      // Check if email is in whitelist
      const isAllowed = await checkIfEmailAllowed(userEmail);
      if (!isAllowed) {
        console.log('User email not in whitelist:', userEmail);
        await firebaseSignOut(auth);
        throw new Error('ACCESS_DENIED');
      }

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        
        await setDoc(userDocRef, {
          ...data,
          lastLogin: new Date(),
        }, { merge: true });

        return {
          uid: user.uid,
          email: userEmail,
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
          role: data.role || 'user',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: new Date(),
        };
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: userEmail,
          displayName: user.displayName || '',
          photoURL: user.photoURL || undefined,
          role: 'user',
          createdAt: new Date(),
          lastLogin: new Date(),
        };

        await setDoc(userDocRef, {
          ...newProfile,
          createdAt: new Date(),
          lastLogin: new Date(),
        });

        return newProfile;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error instanceof Error && error.message === 'ACCESS_DENIED') {
        throw error;
      }
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const profile = await fetchUserProfile(user);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signOut,
    isAdmin: userProfile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
