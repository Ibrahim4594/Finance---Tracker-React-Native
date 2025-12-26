import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Category, Budget, UserSettings } from '../types';
import { ALL_CATEGORIES } from '../constants/categories';
import {
  syncTransaction,
  getTransactions,
  deleteTransaction as deleteTransactionFromFirestore,
  syncCategories,
  getCategories,
  syncBudget,
  getBudgets,
  syncSettings,
  getSettings,
  subscribeToTransactions,
} from '../services/firestoreService';
import { Unsubscribe } from 'firebase/firestore';

interface AppState {
  // Data
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: UserSettings;
  userId: string | null;
  isOnline: boolean;
  isSyncing: boolean;

  // Actions
  setUserId: (userId: string | null) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  setBudget: (budget: Budget) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;

  updateSettings: (settings: Partial<UserSettings>) => void;

  loadData: () => Promise<void>;
  saveData: () => Promise<void>;
  syncWithFirestore: () => Promise<void>;
  subscribeToRealtimeUpdates: () => Unsubscribe | null;
}

const STORAGE_KEYS = {
  TRANSACTIONS: '@finance_tracker_transactions',
  CATEGORIES: '@finance_tracker_categories',
  BUDGETS: '@finance_tracker_budgets',
  SETTINGS: '@finance_tracker_settings',
};

export const useStore = create<AppState>((set, get) => ({
  // Initial State
  transactions: [],
  categories: ALL_CATEGORIES,
  budgets: [],
  settings: {
    currency: 'USD',
    darkMode: false,
    biometricEnabled: false,
    notifications: true,
    language: 'en',
  },
  userId: null,
  isOnline: true,
  isSyncing: false,

  // Set User ID (called when auth state changes)
  setUserId: (userId) => {
    set({ userId });
    if (userId) {
      // Load data from Firestore when user logs in
      get().syncWithFirestore();
    }
  },

  // Transaction Actions
  addTransaction: async (transactionData) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }));

    // Save to local storage first
    get().saveData();

    // Sync to Firestore if user is logged in
    const { userId } = get();
    if (userId) {
      try {
        await syncTransaction(userId, newTransaction);
      } catch (error) {
        console.log('Failed to sync transaction to cloud:', error);
      }
    }

    // Check budget and send notification if needed
    if (newTransaction.type === 'expense') {
      import('../utils/notifications').then(({ sendBudgetAlert }) => {
        const state = get();
        const category = state.categories.find(cat => cat.id === newTransaction.categoryId);

        if (category?.budgetLimit) {
          const monthStart = new Date();
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);

          const monthExpenses = state.transactions.filter(txn => {
            const txnDate = typeof txn.date === 'string' ? new Date(txn.date) : txn.date;
            return (
              txn.type === 'expense' &&
              txn.categoryId === category.id &&
              txnDate >= monthStart
            );
          });

          const totalSpent = monthExpenses.reduce((sum, txn) => sum + txn.amount, 0);
          const percentage = (totalSpent / category.budgetLimit) * 100;

          if (percentage >= 75) {
            sendBudgetAlert(
              category.name,
              percentage,
              totalSpent,
              category.budgetLimit,
              state.settings.currency
            );
          }
        }
      });
    }
  },

  updateTransaction: async (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map((txn) =>
        txn.id === id ? { ...txn, ...updates, updatedAt: new Date() } : txn
      ),
    }));

    get().saveData();

    // Sync to Firestore
    const { userId, transactions } = get();
    if (userId) {
      const updatedTransaction = transactions.find(t => t.id === id);
      if (updatedTransaction) {
        try {
          await syncTransaction(userId, updatedTransaction);
        } catch (error) {
          console.log('Failed to sync transaction update:', error);
        }
      }
    }
  },

  deleteTransaction: async (id) => {
    set((state) => ({
      transactions: state.transactions.filter((txn) => txn.id !== id),
    }));

    get().saveData();

    // Delete from Firestore
    const { userId } = get();
    if (userId) {
      try {
        await deleteTransactionFromFirestore(userId, id);
      } catch (error) {
        console.log('Failed to delete transaction from cloud:', error);
      }
    }
  },

  // Category Actions
  addCategory: async (categoryData) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    set((state) => ({
      categories: [...state.categories, newCategory],
    }));

    get().saveData();

    // Sync to Firestore
    const { userId, categories } = get();
    if (userId) {
      try {
        await syncCategories(userId, categories);
      } catch (error) {
        console.log('Failed to sync categories:', error);
      }
    }
  },

  updateCategory: async (id, updates) => {
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      ),
    }));

    get().saveData();

    // Sync to Firestore
    const { userId, categories } = get();
    if (userId) {
      try {
        await syncCategories(userId, categories);
      } catch (error) {
        console.log('Failed to sync category update:', error);
      }
    }
  },

  deleteCategory: async (id) => {
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    }));

    get().saveData();

    // Sync to Firestore
    const { userId, categories } = get();
    if (userId) {
      try {
        await syncCategories(userId, categories);
      } catch (error) {
        console.log('Failed to sync category deletion:', error);
      }
    }
  },

  // Budget Actions
  setBudget: async (budget) => {
    set((state) => ({
      budgets: [...state.budgets.filter((b) => b.month !== budget.month), budget],
    }));

    get().saveData();

    // Sync to Firestore
    const { userId } = get();
    if (userId) {
      try {
        await syncBudget(userId, budget);
      } catch (error) {
        console.log('Failed to sync budget:', error);
      }
    }
  },

  updateBudget: async (id, updates) => {
    set((state) => ({
      budgets: state.budgets.map((budget) =>
        budget.id === id ? { ...budget, ...updates } : budget
      ),
    }));

    get().saveData();

    // Sync to Firestore
    const { userId, budgets } = get();
    if (userId) {
      const updatedBudget = budgets.find(b => b.id === id);
      if (updatedBudget) {
        try {
          await syncBudget(userId, updatedBudget);
        } catch (error) {
          console.log('Failed to sync budget update:', error);
        }
      }
    }
  },

  // Settings Actions
  updateSettings: async (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));

    get().saveData();

    // Sync to Firestore
    const { userId, settings } = get();
    if (userId) {
      try {
        await syncSettings(userId, settings);
      } catch (error) {
        console.log('Failed to sync settings:', error);
      }
    }
  },

  // Storage Actions
  loadData: async () => {
    try {
      const [transactionsData, categoriesData, budgetsData, settingsData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS),
        AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
        AsyncStorage.getItem(STORAGE_KEYS.BUDGETS),
        AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
      ]);

      const parsedTransactions = transactionsData ? JSON.parse(transactionsData) : [];
      const parsedCategories = categoriesData ? JSON.parse(categoriesData) : ALL_CATEGORIES;
      const parsedBudgets = budgetsData ? JSON.parse(budgetsData) : [];
      const parsedSettings = settingsData ? JSON.parse(settingsData) : get().settings;

      // Convert date strings back to Date objects
      const transactionsWithDates = parsedTransactions.map((txn: any) => ({
        ...txn,
        date: new Date(txn.date),
        createdAt: new Date(txn.createdAt),
        updatedAt: new Date(txn.updatedAt),
      }));

      set({
        transactions: transactionsWithDates,
        categories: parsedCategories,
        budgets: parsedBudgets,
        settings: parsedSettings,
      });
    } catch (error) {
      console.error('Error loading data from local storage:', error);
    }
  },

  saveData: async () => {
    try {
      const state = get();
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions)),
        AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories)),
        AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(state.budgets)),
        AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings)),
      ]);
    } catch (error) {
      console.error('Error saving data to local storage:', error);
    }
  },

  // Sync with Firestore (pull data from cloud)
  syncWithFirestore: async () => {
    const { userId } = get();
    if (!userId) return;

    set({ isSyncing: true });

    try {
      // Fetch all data from Firestore
      const [firestoreTransactions, firestoreCategories, firestoreBudgets, firestoreSettings] =
        await Promise.all([
          getTransactions(userId).catch(() => []),
          getCategories(userId).catch(() => []),
          getBudgets(userId).catch(() => []),
          getSettings(userId).catch(() => null),
        ]);

      // Merge with local data (Firestore takes precedence for existing items)
      const { transactions: localTransactions, categories: localCategories } = get();

      // Use Firestore data if available, otherwise keep local
      const mergedTransactions = firestoreTransactions.length > 0
        ? firestoreTransactions
        : localTransactions;

      const mergedCategories = firestoreCategories.length > 0
        ? firestoreCategories
        : localCategories;

      set({
        transactions: mergedTransactions,
        categories: mergedCategories.length > 0 ? mergedCategories : ALL_CATEGORIES,
        budgets: firestoreBudgets,
        settings: firestoreSettings || get().settings,
        isSyncing: false,
      });

      // Save merged data locally
      get().saveData();

      // If local has data but Firestore doesn't, sync local to Firestore
      if (localTransactions.length > 0 && firestoreTransactions.length === 0) {
        for (const txn of localTransactions) {
          await syncTransaction(userId, txn).catch(() => {});
        }
      }

      if (localCategories.length > 0 && firestoreCategories.length === 0) {
        await syncCategories(userId, localCategories).catch(() => {});
      }

    } catch (error) {
      console.error('Error syncing with Firestore:', error);
      set({ isSyncing: false });
    }
  },

  // Subscribe to real-time updates
  subscribeToRealtimeUpdates: () => {
    const { userId } = get();
    if (!userId) return null;

    // Subscribe to transaction changes
    const unsubscribe = subscribeToTransactions(userId, (transactions) => {
      set({ transactions });
      // Also update local storage
      AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)).catch(() => {});
    });

    return unsubscribe;
  },
}));
