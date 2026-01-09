
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db, isFirebaseEnabled } from './firebase';
import { Business, UserProfile } from '../types';

// --- Helpers ---

export const convertTimestamps = (data: any): any => {
  if (data === null || data === undefined) return data;
  if (data instanceof firebase.firestore.Timestamp) return data.toDate();
  if (Array.isArray(data)) return data.map((item: any) => convertTimestamps(item));
  if (typeof data === 'object') {
    const newData: any = {};
    for (const key of Object.keys(data)) {
      newData[key] = convertTimestamps(data[key]);
    }
    return newData;
  }
  return data;
};

export const reviveDates = (data: any): any => {
  if (data === null || data === undefined) return data;
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
  if (typeof data === 'string') {
      if (dateRegex.test(data)) return new Date(data);
      return data;
  }
  if (Array.isArray(data)) return data.map((item: any) => reviveDates(item));
  if (typeof data === 'object') {
    const newData: any = {};
    for (const key of Object.keys(data)) {
      newData[key] = reviveDates(data[key]);
    }
    return newData;
  }
  return data;
};

// Helper to remove undefined values which Firebase doesn't support
const sanitizeData = (data: any): any => {
  if (data instanceof Date) return data;
  if (Array.isArray(data)) return data.map(sanitizeData);
  if (data !== null && typeof data === 'object') {
    const newObj: any = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== undefined) {
        newObj[key] = sanitizeData(value);
      }
    });
    return newObj;
  }
  return data;
};

// --- LOCAL STORAGE HELPERS ---
const LOCAL_STORAGE_KEY_PROFILE = 'bahi_khata_profile';
const LOCAL_STORAGE_KEY_BUSINESSES = 'bahi_khata_businesses';

const getLocalBusinesses = (): Business[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_BUSINESSES);
    return raw ? reviveDates(JSON.parse(raw)) : [];
  } catch { return []; }
};

const saveLocalBusinesses = (businesses: Business[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY_BUSINESSES, JSON.stringify(businesses));
};

// --- User Profile ---

export const saveUserProfileToDB = async (profile: UserProfile) => {
  if (isFirebaseEnabled && db && profile.id) {
    const safeData = sanitizeData(profile);
    await db.collection('users').doc(profile.id).set(safeData, { merge: true });
  } else {
    // Local Storage Fallback
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }
};

export const loadUserProfileFromDB = async (userId: string): Promise<UserProfile | null> => {
  if (isFirebaseEnabled && db && userId) {
    const snap = await db.collection('users').doc(userId).get();
    if (snap.exists) {
      return convertTimestamps(snap.data()) as UserProfile;
    }
  } else {
    // Local Storage Fallback
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
    if (raw) return reviveDates(JSON.parse(raw));
  }
  return null;
};

// --- Business Operations ---

export const addBusinessToFirestore = async (userId: string, business: Business) => {
  if (isFirebaseEnabled && db) {
    const safeData = sanitizeData(business);
    await db.collection('users').doc(userId).collection('businesses').doc(business.id).set(safeData);
  } else {
    const current = getLocalBusinesses();
    saveLocalBusinesses([...current, business]);
  }
};

export const updateBusinessInFirestore = async (userId: string, business: Business) => {
  if (isFirebaseEnabled && db) {
    const safeData = sanitizeData(business);
    await db.collection('users').doc(userId).collection('businesses').doc(business.id).set(safeData, { merge: true });
  } else {
    const current = getLocalBusinesses();
    const updated = current.map(b => b.id === business.id ? business : b);
    saveLocalBusinesses(updated);
  }
};

export const deleteBusinessFromFirestore = async (userId: string, businessId: string) => {
  if (isFirebaseEnabled && db) {
    await db.collection('users').doc(userId).collection('businesses').doc(businessId).delete();
  } else {
    const current = getLocalBusinesses();
    const updated = current.filter(b => b.id !== businessId);
    saveLocalBusinesses(updated);
  }
};
