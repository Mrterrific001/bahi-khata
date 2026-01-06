import { useState, useEffect } from 'react';
import { Business, BusinessType } from '../types';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, isFirebaseEnabled } from '../lib/firebase';
import { addBusinessToFirestore, updateBusinessInFirestore, deleteBusinessFromFirestore, convertTimestamps, reviveDates } from '../lib/db';

export const useBusinessData = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (!currentUser) {
          setBusinesses([]);
          setIsLoading(false);
        }
      });
      return () => unsubscribe();
    } else {
      setUser({ uid: 'guest_user', email: 'guest@local.app' });
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    if (isFirebaseEnabled && db) {
      setIsLoading(true);
      const businessesRef = collection(db, 'users', user.uid, 'businesses');
      const q = query(businessesRef); 

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loadedBusinesses: Business[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedBusinesses.push(convertTimestamps(data) as Business);
        });
        setBusinesses(loadedBusinesses);
        setIsLoading(false);
      }, (error) => {
        console.error("Firestore Error:", error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      const loadLocal = () => {
        try {
           const raw = localStorage.getItem('bahi_khata_businesses');
           if (raw) {
               setBusinesses(reviveDates(JSON.parse(raw)));
           }
        } catch (e) {
           console.error("Local load error", e);
        }
        setIsLoading(false);
      };
      loadLocal();
    }
  }, [user]);

  const addBusiness = (type: BusinessType, name: string, ownerName?: string) => {
    if (!user) return '';
    
    const newId = crypto.randomUUID();
    const newBusiness: Business = { 
        id: newId, 
        name, 
        ownerName, 
        type, 
        createdAt: new Date(), 
        isNew: true, 
        isPinned: false,
        classes: [], 
        customerGroups: type === BusinessType.SHOP ? [{ id: 'general', name: 'General' }] : [], 
        customers: [] 
    };
    
    addBusinessToFirestore(user.uid, newBusiness);
    
    if (!isFirebaseEnabled) {
        setBusinesses(prev => [...prev, newBusiness]);
    }
    
    return newId;
  };

  const updateBusiness = (updatedBusiness: Business) => {
    if (!user) return;
    updateBusinessInFirestore(user.uid, updatedBusiness);
    
    if (!isFirebaseEnabled) {
        setBusinesses(prev => prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b));
    }
  };

  const deleteBusiness = (id: string) => {
    if (!user) return;
    deleteBusinessFromFirestore(user.uid, id);
    
    if (!isFirebaseEnabled) {
        setBusinesses(prev => prev.filter(b => b.id !== id));
    }
  };

  const toggleClassPin = (businessId: string, classId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (!business || !user) return;

    const updatedBusiness = {
        ...business, 
        classes: business.classes?.map(c => c.id === classId ? { ...c, isPinned: !c.isPinned } : c)
    };
    updateBusiness(updatedBusiness);
  };

  const toggleBusinessPin = (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (!business || !user) return;

    const updatedBusiness = {
        ...business, 
        isPinned: !business.isPinned 
    };
    updateBusiness(updatedBusiness);
  };

  const importData = (importedBusinesses: Business[]) => {
      if (!user) return;
      importedBusinesses.forEach(b => {
          const newBusiness = { ...b, id: crypto.randomUUID(), isNew: true };
          if (!isFirebaseEnabled) {
               setBusinesses(prev => {
                   const newState = [...prev, newBusiness];
                   localStorage.setItem('bahi_khata_businesses', JSON.stringify(newState));
                   return newState;
               });
          } else {
               addBusinessToFirestore(user.uid, newBusiness);
          }
      });
  };

  return {
    businesses,
    isLoading,
    addBusiness,
    updateBusiness,
    deleteBusiness,
    toggleClassPin,
    toggleBusinessPin,
    importData
  };
};