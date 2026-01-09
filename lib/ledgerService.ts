import { db, isFirebaseEnabled } from './firebase';
import { Business, Student, PaymentRecord } from '../types';

// The Ledger Collection Name
const LEDGER_COLLECTION = 'student_ledger';

export interface LedgerEntry {
  id: string; // Composite: phoneNumber_businessId
  studentId: string;
  studentName: string;
  phoneNumber: string;
  businessId: string;
  businessName: string;
  adminName: string;
  totalDue: number;
  lastUpdated: Date;
  type: 'CLASS' | 'SHOP';
  unreadCount: number; // For notification badge
  timeline: LedgerTimelineItem[];
}

export interface LedgerTimelineItem {
  id: string;
  type: 'PAYMENT' | 'DUE_ADDED' | 'REQUEST';
  amount?: number;
  date: Date;
  title: string;
  message: string;
}

/**
 * Syncs a specific student's data to the public ledger.
 * Call this whenever an Admin updates a student.
 */
export const syncStudentToLedger = async (
  business: Business, 
  student: Student, 
  timelineUpdate?: LedgerTimelineItem
) => {
  if (!isFirebaseEnabled || !db) return;

  // Clean phone number (remove spaces, dashes)
  const cleanPhone = student.phoneNumber.replace(/\D/g, '');
  // CHANGED: Lowered limit from 10 to 3 to allow testing with "1111"
  if (cleanPhone.length < 3) return; 

  const ledgerId = `${cleanPhone}_${business.id}`;
  const docRef = db.collection(LEDGER_COLLECTION).doc(ledgerId);

  try {
    // 1. Get existing data to preserve history if not passed explicitly
    const docSnap = await docRef.get();
    let existingTimeline: LedgerTimelineItem[] = [];
    let unreadCount = 0;

    if (docSnap.exists) {
       const data = docSnap.data();
       existingTimeline = data?.timeline || [];
       unreadCount = data?.unreadCount || 0;
    }

    // 2. Add new timeline item if exists
    if (timelineUpdate) {
        existingTimeline = [timelineUpdate, ...existingTimeline].slice(0, 50); // Keep last 50 events
        unreadCount += 1;
    }

    // 3. Construct Payload
    const payload: LedgerEntry = {
        id: ledgerId,
        studentId: student.id,
        studentName: student.name,
        phoneNumber: cleanPhone,
        businessId: business.id,
        businessName: business.name,
        adminName: business.ownerName || 'Admin',
        totalDue: student.totalDue,
        lastUpdated: new Date(),
        type: business.type === 'TEACHER_STUDENT' ? 'CLASS' : 'SHOP',
        unreadCount: unreadCount,
        timeline: existingTimeline
    };

    // 4. Write to Firestore
    await docRef.set(payload, { merge: true });
    console.log(`Synced student ${student.name} (${cleanPhone}) to ledger.`);

  } catch (error) {
      console.error("Error syncing to ledger:", error);
  }
};

/**
 * Marks a ledger entry as read by the student.
 */
export const markLedgerAsRead = async (ledgerId: string) => {
    if (!isFirebaseEnabled || !db) return;
    try {
        await db.collection(LEDGER_COLLECTION).doc(ledgerId).update({
            unreadCount: 0
        });
    } catch (e) {
        console.error("Failed to mark read", e);
    }
};
