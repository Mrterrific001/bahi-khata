import { useState, useEffect } from 'react';
import { db, auth, isFirebaseEnabled } from '../lib/firebase';
import { LedgerEntry, markLedgerAsRead } from '../lib/ledgerService';
import { convertTimestamps } from '../lib/db';
import { loadUserProfileFromDB } from '../lib/db';

export const useStudentGroups = () => {
  const [groups, setGroups] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // 1. Get Logged In User Phone
  useEffect(() => {
    const fetchUser = async () => {
        if (!isFirebaseEnabled || !auth?.currentUser) {
            setLoading(false);
            return;
        }

        const profile = await loadUserProfileFromDB(auth.currentUser.uid);
        if (profile?.phoneNumber) {
             // Clean phone for matching
             const clean = profile.phoneNumber.replace(/\D/g, '');
             setUserPhone(clean);
        } else {
            setLoading(false);
        }
    };
    fetchUser();
  }, []);

  // 2. Subscribe to Ledger
  useEffect(() => {
      if (!userPhone || !isFirebaseEnabled || !db) return;

      setLoading(true);
      const unsubscribe = db.collection('student_ledger')
        .where('phoneNumber', '==', userPhone)
        .onSnapshot(snapshot => {
            const data: LedgerEntry[] = [];
            snapshot.forEach(doc => {
                data.push(convertTimestamps(doc.data()) as LedgerEntry);
            });
            // Sort by last updated
            data.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
            setGroups(data);
            setLoading(false);
        }, err => {
            console.error("Ledger fetch error", err);
            setLoading(false);
        });

      return () => unsubscribe();
  }, [userPhone]);

  const markRead = (ledgerId: string) => {
      markLedgerAsRead(ledgerId);
  };

  return { groups, loading, markRead, userPhone };
};
