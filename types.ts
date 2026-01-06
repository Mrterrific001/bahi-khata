
export enum BusinessType {
  TEACHER_STUDENT = 'TEACHER_STUDENT',
  SHOP = 'SHOP'
}

export type PaymentType = 'PAYMENT' | 'DUE_ADDED';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: Date;
  description: string;
  type?: PaymentType; // New: Distinguish between paying and adding debt
}

export interface CustomerGroup {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  fatherName?: string;
  address?: string;
  phoneNumber: string;
  photoUrl?: string;
  totalDue: number;
  advanceAmount: number;
  pendingMonths: string[];
  paymentHistory: PaymentRecord[];
  joiningDate: Date;
  createdAt: Date;
}

export interface ClassGroup {
  id: string;
  standard: string;
  batchName?: string;
  feeAmount: number;
  totalCourseFee?: number;
  courseDuration?: number;
  startDate?: Date;
  feeOverrides?: Record<string, number>;
  createdAt: Date;
  students?: Student[];
  isPinned?: boolean;
}

export interface Customer {
  id: string;
  groupId: string;
  name: string;
  phoneNumber: string;
  address?: string;
  photoUrl?: string; 
  totalDue: number;
  advanceAmount: number;
  paymentHistory: PaymentRecord[];
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean; 
}

export interface Business {
  id: string;
  name: string;
  ownerName?: string;
  type: BusinessType;
  createdAt: Date;
  isNew?: boolean;
  isPinned?: boolean; // New: Pin Business support
  classes?: ClassGroup[];
  customerGroups?: CustomerGroup[]; 
  customers?: Customer[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  photoUrl?: string;
  businessName?: string;
  createdAt: Date;
}
