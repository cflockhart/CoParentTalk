export type ParentId = 'sarah' | 'david';

export interface ChildProfile {
  id: string;
  name: string;
  birthdate: string;
  clothingSizes: {
    shirt: string;
    pants: string;
    shoes: string;
  };
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  schoolInfo: {
    name: string;
    teacher: string;
    contact: string;
  };
  contacts: {
    pediatrician: string;
    dentist: string;
    emergency: string;
  };
  approvalStatus: 'pending' | 'approved';
  addedBy: ParentId;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  parent: ParentId | 'both';
  type: 'custody' | 'appointment' | 'school' | 'medical' | 'other';
  description?: string;
  swapRequest?: {
    id: string;
    requestedParent: ParentId;
    status: 'pending' | 'approved' | 'declined';
    originalParent: ParentId;
  };
}

export interface Message {
  id: string;
  senderId: ParentId;
  timestamp: string; // ISO string
  text: string;
  toneScore: 'positive' | 'neutral' | 'negative';
  toneAdvice?: string;
  readBy: ParentId[];
}

export interface ExpensePayment {
  id: string;
  paidById: ParentId;
  amount: number;
  date: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'medical' | 'education' | 'extracurricular' | 'clothing' | 'other';
  splitPercent: number; // Percentage that Parent A (Sarah) pays, e.g. 50, 60, etc.
  loggedById: ParentId;
  date: string;
  receiptUrl?: string; // Simulated URL or placeholder
  status: 'unpaid' | 'paid';
  payments: ExpensePayment[];
  description?: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO string
  loggedById: ParentId;
  title: string;
  note: string;
  photoUrl?: string;
  isCheckedIn: boolean;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}
