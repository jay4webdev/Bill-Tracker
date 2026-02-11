
export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export interface Bill {
  id: string;
  companyName: string;
  staffName: string; // Renamed from vendor
  description: string;
  amount: number;
  billDate: string; // ISO date string YYYY-MM-DD
  dueDate: string; // ISO date string YYYY-MM-DD
  status: PaymentStatus;
  category: string;
  subcategory?: string;
}

export interface CompanySummary {
  name: string;
  totalPending: number;
  totalPaid: number;
  overdueCount: number;
}

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, this would be hashed
  fullName: string;
  role: UserRole;
}

export type View = 'login' | 'dashboard' | 'bills' | 'add-bill' | 'insights' | 'categories' | 'calendar' | 'users';
