import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration - HARDCODED for production stability
// TODO: Move to environment variables once CRA env loading is fixed
console.log('🔥 Using hardcoded Firebase config for discover-africa-quotation-app');

const firebaseConfig = {
  apiKey: "AIzaSyB1iPMUrkLgN-CYb31aI-adCOovhmzzvso",
  authDomain: "discover-africa-quotation-app.firebaseapp.com",
  projectId: "discover-africa-quotation-app",
  storageBucket: "discover-africa-quotation-app.firebasestorage.app",
  messagingSenderId: "553508233874",
  appId: "1:553508233874:web:a2f0c45b40dd2383c5fc4b"
};

// Initialize Firebase app (only if not already initialized)
let firebaseApp: FirebaseApp;
try {
  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
  } else {
    firebaseApp = getApps()[0];
    console.log('✅ Using existing Firebase app');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  throw error;
}

// Initialize Firebase services
export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const storage: FirebaseStorage = getStorage(firebaseApp);

// Export the app instance as well
export { firebaseApp };

