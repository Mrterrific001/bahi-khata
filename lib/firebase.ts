
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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

let auth: firebase.auth.Auth | null = null;
let googleProvider: firebase.auth.GoogleAuthProvider | null = null;
let db: firebase.firestore.Firestore | null = null;

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

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    } else {
      firebase.app();
    }
    
    auth = firebase.auth();
    googleProvider = new firebase.auth.GoogleAuthProvider();
    db = firebase.firestore();
    
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
}

export { auth, googleProvider, db };
