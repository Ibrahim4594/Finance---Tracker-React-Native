// Type Definitions for Finance Tracker App

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryId: string;
  description: string;
  date: Date;
  receiptImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  budgetLimit?: number;
}

export interface CategoryBudget {
  categoryId: string;
  limit: number;
  spent: number;
}

export interface Budget {
  id: string;
  month: string; // Format: "2025-01"
  totalBudget: number;
  categoryBudgets: CategoryBudget[];
}

export interface UserSettings {
  currency: string;
  darkMode: boolean;
  biometricEnabled: boolean;
  notifications: boolean;
  language: string;
}

export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  averageDaily: number;
}

// Navigation Types
export type RootStackParamList = {
  // Auth Stack
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;

  // Main App Stack
  Main: undefined;
  AddTransaction: { transaction?: Transaction };
  TransactionDetail: { transactionId: string };
  EditBudget: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Budget: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  icon: string;
  color: string;
  createdAt: Date;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  categoryId: string;
  description: string;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
  lastProcessed?: Date;
  isActive: boolean;
  createdAt: Date;
}
