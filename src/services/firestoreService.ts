import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Transaction, Category, Budget, UserSettings } from '../types';

// User Data Path Helpers
const getUserPath = (userId: string) => `users/${userId}`;
const getTransactionsPath = (userId: string) => `users/${userId}/transactions`;
const getCategoriesPath = (userId: string) => `users/${userId}/categories`;
const getBudgetsPath = (userId: string) => `users/${userId}/budgets`;
const getSettingsPath = (userId: string) => `users/${userId}/settings`;

// ==================== TRANSACTIONS ====================

export const syncTransaction = async (userId: string, transaction: Transaction): Promise<void> => {
  try {
    const transactionRef = doc(db, getTransactionsPath(userId), transaction.id);

    // Safely convert dates to ISO strings
    const dateToISO = (date: Date | string) => {
      if (typeof date === 'string') return date;
      return date instanceof Date ? date.toISOString() : new Date().toISOString();
    };

    await setDoc(transactionRef, {
      ...transaction,
      date: dateToISO(transaction.date),
      createdAt: dateToISO(transaction.createdAt),
      updatedAt: dateToISO(transaction.updatedAt),
      syncedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error syncing transaction:', error);
    throw error;
  }
};

// Safe date parser
const parseDate = (dateValue: any): Date => {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === 'string') return new Date(dateValue);
  if (dateValue.toDate) return dateValue.toDate(); // Firestore Timestamp
  return new Date();
};

export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const q = query(collection(db, getTransactionsPath(userId)), orderBy('date', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: parseDate(data.date),
        createdAt: parseDate(data.createdAt),
        updatedAt: parseDate(data.updatedAt),
      } as Transaction;
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

export const deleteTransaction = async (userId: string, transactionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, getTransactionsPath(userId), transactionId));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// ==================== CATEGORIES ====================

export const syncCategories = async (userId: string, categories: Category[]): Promise<void> => {
  try {
    const batch = categories.map((category) =>
      setDoc(doc(db, getCategoriesPath(userId), category.id), category)
    );
    await Promise.all(batch);
  } catch (error) {
    console.error('Error syncing categories:', error);
    throw error;
  }
};

export const getCategories = async (userId: string): Promise<Category[]> => {
  try {
    const snapshot = await getDocs(collection(db, getCategoriesPath(userId)));
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Category));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// ==================== BUDGETS ====================

export const syncBudget = async (userId: string, budget: Budget): Promise<void> => {
  try {
    await setDoc(doc(db, getBudgetsPath(userId), budget.id), budget);
  } catch (error) {
    console.error('Error syncing budget:', error);
    throw error;
  }
};

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  try {
    const snapshot = await getDocs(collection(db, getBudgetsPath(userId)));
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Budget));
  } catch (error) {
    console.error('Error getting budgets:', error);
    throw error;
  }
};

// ==================== SETTINGS ====================

export const syncSettings = async (userId: string, settings: UserSettings): Promise<void> => {
  try {
    await setDoc(doc(db, getUserPath(userId), 'settings'), settings);
  } catch (error) {
    console.error('Error syncing settings:', error);
    throw error;
  }
};

export const getSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const docSnap = await getDoc(doc(db, getUserPath(userId), 'settings'));
    return docSnap.exists() ? (docSnap.data() as UserSettings) : null;
  } catch (error) {
    console.error('Error getting settings:', error);
    throw error;
  }
};

// ==================== REAL-TIME LISTENERS ====================

export const subscribeToTransactions = (
  userId: string,
  callback: (transactions: Transaction[]) => void
): Unsubscribe => {
  const q = query(collection(db, getTransactionsPath(userId)), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: parseDate(data.date),
          createdAt: parseDate(data.createdAt),
          updatedAt: parseDate(data.updatedAt),
        } as Transaction;
      });
      callback(transactions);
    },
    (error) => {
      console.error('Error in transaction subscription:', error);
    }
  );
};

// ==================== INITIAL USER SETUP ====================

export const createUserProfile = async (
  userId: string,
  email: string,
  displayName: string
): Promise<void> => {
  try {
    await setDoc(doc(db, getUserPath(userId)), {
      email,
      displayName,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};
