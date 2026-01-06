import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const getEnv = (key: string) => {
  try {
    return (import.meta as any).env[key];
  } catch (e) {
    return undefined;
  }
};

const apiKey = getEnv('VITE_FIREBASE_API_KEY');
const projectId = getEnv('VITE_FIREBASE_PROJECT_ID');

export const isFirebaseEnabled = !!(apiKey && projectId);

let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let db: Firestore | null = null;

if (isFirebaseEnabled) {
  try {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
      projectId: projectId,
      storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: getEnv('VITE_FIREBASE_APP_ID')
    };

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    db = getFirestore(app);
    
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
}

export { auth, googleProvider, db };