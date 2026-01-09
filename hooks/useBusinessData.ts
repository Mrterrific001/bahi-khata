import { useState, useEffect } from 'react';
import { Business, BusinessType } from '../types';
import { db, auth, isFirebaseEnabled } from '../lib/firebase';
import { addBusinessToFirestore, updateBusinessInFirestore, deleteBusinessFromFirestore, convertTimestamps, reviveDates } from '../lib/db';
import { syncStudentToLedger, LedgerTimelineItem } from '../lib/ledgerService';

export const useBusinessData = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (isFirebaseEnabled && auth) {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {
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
      const unsubscribe = db.collection('users').doc(user.uid).collection('businesses')
        .onSnapshot((snapshot) => {
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
        type, 
        createdAt: new Date(), 
        isNew: true, 
        isPinned: false,
        classes: [], 
        customerGroups: type === BusinessType.SHOP ? [{ id: 'general', name: 'General' }] : [], 
        customers: [],
        ...(ownerName ? { ownerName } : {})
    };
    
    addBusinessToFirestore(user.uid, newBusiness).catch(e => console.error("Failed to add business", e));
    
    if (!isFirebaseEnabled) {
        setBusinesses(prev => [...prev, newBusiness]);
    }
    
    return newId;
  };

  /**
   * Enhanced update function that checks for student changes and syncs to ledger.
   * In a real production app, this diffing logic should move to a Cloud Function.
   */
  const updateBusiness = async (updatedBusiness: Business) => {
    if (!user) return;
    
    try {
        // Optimistic Update
        await updateBusinessInFirestore(user.uid, updatedBusiness);
        
        if (!isFirebaseEnabled) {
            setBusinesses(prev => prev.map(b => b.id === updatedBusiness.id ? updatedBusiness : b));
            return;
        }

        // --- LEDGER SYNC LOGIC ---
        // We need to find what changed. Since this is a heavy client-side operation, 
        // we only do it if the user is authenticated.
        
        // Find the old version of this business
        const oldBusiness = businesses.find(b => b.id === updatedBusiness.id);
        if (!oldBusiness) return;

        // 1. Check Classes for changes
        if (updatedBusiness.type === BusinessType.TEACHER_STUDENT && updatedBusiness.classes) {
            updatedBusiness.classes.forEach(newClass => {
                const oldClass = oldBusiness.classes?.find(c => c.id === newClass.id);
                // If oldClass doesn't exist, we might want to sync all students, but usually classes start empty.
                const oldStudents = oldClass?.students || [];
                
                newClass.students?.forEach(newStudent => {
                    const oldStudent = oldStudents.find(s => s.id === newStudent.id);
                    
                    // If new student or changes detected
                    if (!oldStudent || JSON.stringify(oldStudent) !== JSON.stringify(newStudent)) {
                        
                        let timelineEvent: LedgerTimelineItem | undefined;

                        if (oldStudent) {
                             // --- EXISTING STUDENT UPDATES ---
                             // Detect Payment
                            if (newStudent.paymentHistory.length > oldStudent.paymentHistory.length) {
                                const lastPayment = newStudent.paymentHistory[newStudent.paymentHistory.length - 1];
                                timelineEvent = {
                                    id: lastPayment.id,
                                    type: 'PAYMENT',
                                    amount: lastPayment.amount,
                                    date: lastPayment.date,
                                    title: 'Due Cleared',
                                    message: lastPayment.description
                                };
                            } 
                            // Detect Due Added
                            else if (newStudent.totalDue > oldStudent.totalDue) {
                                const diff = newStudent.totalDue - oldStudent.totalDue;
                                timelineEvent = {
                                    id: crypto.randomUUID(),
                                    type: 'DUE_ADDED',
                                    amount: diff,
                                    date: new Date(),
                                    title: 'Due Added',
                                    message: 'New fees or charges added by admin.'
                                };
                            }
                        } else {
                            // --- NEW STUDENT ADDED ---
                            // Create initial timeline event if they start with a due
                            if (newStudent.totalDue > 0) {
                                timelineEvent = {
                                    id: crypto.randomUUID(),
                                    type: 'DUE_ADDED',
                                    amount: newStudent.totalDue,
                                    date: new Date(),
                                    title: 'Joined Institute',
                                    message: `Added to ${newClass.batchName || 'Class ' + newClass.standard} with initial due.`
                                };
                            }
                        }

                        // Perform Sync
                        syncStudentToLedger(updatedBusiness, newStudent, timelineEvent);
                    }
                });
            });
        }
    } catch (error) {
        console.error("Failed to update business:", error);
    }
  };

  const deleteBusiness = (id: string) => {
    if (!user) return;
    deleteBusinessFromFirestore(user.uid, id).catch(e => console.error("Failed to delete", e));
    
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
