import {
  formatCurrency,
  formatDate,
  getCurrentMonthKey,
  getMonthKey,
  calculateMonthlyStats,
  calculateSpendingByCategory,
  getCurrentMonthTransactions,
  getRecentTransactions,
} from '../formatters';
import { Transaction, Category } from '../../types';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('should format negative amounts as positive', () => {
      expect(formatCurrency(-500, 'USD')).toBe('$500.00');
    });

    it('should default to USD when no currency provided', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('should format EUR currency correctly', () => {
      expect(formatCurrency(999.99, 'EUR')).toBe('€999.99');
    });

    it('should handle zero amount', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    it('should format large amounts with commas', () => {
      expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('should format Date object with default format', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2025');
    });

    it('should format string date with default format', () => {
      expect(formatDate('2025-12-25')).toBe('Dec 25, 2025');
    });

    it('should format with custom format string', () => {
      const date = new Date('2025-03-10');
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('2025-03-10');
    });

    it('should format with different custom format', () => {
      const date = new Date('2025-06-20');
      expect(formatDate(date, 'dd/MM/yyyy')).toBe('20/06/2025');
    });
  });

  describe('getCurrentMonthKey', () => {
    it('should return current month in yyyy-MM format', () => {
      const result = getCurrentMonthKey();
      expect(result).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe('getMonthKey', () => {
    it('should return month key for given date', () => {
      const date = new Date('2025-05-15');
      expect(getMonthKey(date)).toBe('2025-05');
    });

    it('should return correct month key for January', () => {
      const date = new Date('2025-01-01');
      expect(getMonthKey(date)).toBe('2025-01');
    });

    it('should return correct month key for December', () => {
      const date = new Date('2025-12-31');
      expect(getMonthKey(date)).toBe('2025-12');
    });
  });

  describe('calculateMonthlyStats', () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        amount: 5000,
        type: 'income',
        categoryId: 'salary',
        description: 'Salary',
        date: new Date('2025-01-05'),
      },
      {
        id: '2',
        amount: 100,
        type: 'expense',
        categoryId: 'food',
        description: 'Groceries',
        date: new Date('2025-01-10'),
      },
      {
        id: '3',
        amount: 50,
        type: 'expense',
        categoryId: 'transport',
        description: 'Gas',
        date: new Date('2025-01-15'),
      },
      {
        id: '4',
        amount: 200,
        type: 'expense',
        categoryId: 'food',
        description: 'Restaurant',
        date: new Date('2024-12-20'), // Previous month
      },
    ];

    it('should calculate stats for specified month', () => {
      const stats = calculateMonthlyStats(mockTransactions, '2025-01');

      expect(stats.totalIncome).toBe(5000);
      expect(stats.totalExpenses).toBe(150);
      expect(stats.balance).toBe(4850);
      expect(stats.transactionCount).toBe(3);
      expect(stats.averageDaily).toBeCloseTo(4.84, 1);
    });

    it('should exclude transactions from other months', () => {
      const stats = calculateMonthlyStats(mockTransactions, '2024-12');

      expect(stats.transactionCount).toBe(1);
      expect(stats.totalExpenses).toBe(200);
    });

    it('should handle empty transactions', () => {
      const stats = calculateMonthlyStats([], '2025-01');

      expect(stats.totalIncome).toBe(0);
      expect(stats.totalExpenses).toBe(0);
      expect(stats.balance).toBe(0);
      expect(stats.transactionCount).toBe(0);
    });

    it('should handle only income transactions', () => {
      const incomeOnly: Transaction[] = [
        {
          id: '1',
          amount: 3000,
          type: 'income',
          categoryId: 'salary',
          description: 'Salary',
          date: new Date('2025-01-01'),
        },
      ];

      const stats = calculateMonthlyStats(incomeOnly, '2025-01');

      expect(stats.totalIncome).toBe(3000);
      expect(stats.totalExpenses).toBe(0);
      expect(stats.balance).toBe(3000);
    });

    it('should handle only expense transactions', () => {
      const expensesOnly: Transaction[] = [
        {
          id: '1',
          amount: 500,
          type: 'expense',
          categoryId: 'food',
          description: 'Groceries',
          date: new Date('2025-01-15'),
        },
      ];

      const stats = calculateMonthlyStats(expensesOnly, '2025-01');

      expect(stats.totalIncome).toBe(0);
      expect(stats.totalExpenses).toBe(500);
      expect(stats.balance).toBe(-500);
    });
  });

  describe('calculateSpendingByCategory', () => {
    const mockCategories: Category[] = [
      { id: 'food', name: 'Food', icon: '🍔', color: '#FF6B6B', type: 'expense' },
      { id: 'transport', name: 'Transport', icon: '🚗', color: '#4ECDC4', type: 'expense' },
      { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#95E1D3', type: 'expense' },
      { id: 'salary', name: 'Salary', icon: '💰', color: '#F38181', type: 'income' },
    ];

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        amount: 300,
        type: 'expense',
        categoryId: 'food',
        description: 'Groceries',
        date: new Date('2025-01-05'),
      },
      {
        id: '2',
        amount: 150,
        type: 'expense',
        categoryId: 'food',
        description: 'Restaurant',
        date: new Date('2025-01-10'),
      },
      {
        id: '3',
        amount: 100,
        type: 'expense',
        categoryId: 'transport',
        description: 'Gas',
        date: new Date('2025-01-15'),
      },
      {
        id: '4',
        amount: 50,
        type: 'expense',
        categoryId: 'shopping',
        description: 'Clothes',
        date: new Date('2025-01-20'),
      },
    ];

    it('should calculate spending by category', () => {
      const result = calculateSpendingByCategory(mockTransactions, mockCategories, '2025-01');

      expect(result).toHaveLength(3);
      expect(result[0].categoryName).toBe('Food');
      expect(result[0].amount).toBe(450);
      expect(result[0].percentage).toBeCloseTo(75, 0);
    });

    it('should sort categories by amount descending', () => {
      const result = calculateSpendingByCategory(mockTransactions, mockCategories, '2025-01');

      expect(result[0].amount).toBeGreaterThanOrEqual(result[1].amount);
      expect(result[1].amount).toBeGreaterThanOrEqual(result[2].amount);
    });

    it('should filter out categories with zero spending', () => {
      const oneCategory: Transaction[] = [
        {
          id: '1',
          amount: 100,
          type: 'expense',
          categoryId: 'food',
          description: 'Food',
          date: new Date('2025-01-01'),
        },
      ];

      const result = calculateSpendingByCategory(oneCategory, mockCategories, '2025-01');

      expect(result).toHaveLength(1);
      expect(result[0].categoryName).toBe('Food');
    });

    it('should handle empty transactions', () => {
      const result = calculateSpendingByCategory([], mockCategories, '2025-01');

      expect(result).toHaveLength(0);
    });

    it('should exclude income categories', () => {
      const result = calculateSpendingByCategory(mockTransactions, mockCategories, '2025-01');

      const hasIncomeCategory = result.some((item) => item.categoryName === 'Salary');
      expect(hasIncomeCategory).toBe(false);
    });
  });

  describe('getCurrentMonthTransactions', () => {
    it('should return only current month transactions', () => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          amount: 100,
          type: 'expense',
          categoryId: 'food',
          description: 'Current month',
          date: now,
        },
        {
          id: '2',
          amount: 200,
          type: 'expense',
          categoryId: 'food',
          description: 'Last month',
          date: lastMonth,
        },
      ];

      const result = getCurrentMonthTransactions(mockTransactions);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('getRecentTransactions', () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        amount: 100,
        type: 'expense',
        categoryId: 'food',
        description: 'Old',
        date: new Date('2025-01-01'),
      },
      {
        id: '2',
        amount: 200,
        type: 'expense',
        categoryId: 'food',
        description: 'Recent',
        date: new Date('2025-01-20'),
      },
      {
        id: '3',
        amount: 300,
        type: 'expense',
        categoryId: 'food',
        description: 'Most recent',
        date: new Date('2025-01-25'),
      },
    ];

    it('should return most recent transactions first', () => {
      const result = getRecentTransactions(mockTransactions, 2);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('3');
      expect(result[1].id).toBe('2');
    });

    it('should default to 5 transactions', () => {
      const many = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        amount: 100,
        type: 'expense' as const,
        categoryId: 'food',
        description: 'Test',
        date: new Date(`2025-01-${i + 1}`),
      }));

      const result = getRecentTransactions(many);

      expect(result).toHaveLength(5);
    });

    it('should handle fewer transactions than limit', () => {
      const result = getRecentTransactions(mockTransactions, 10);

      expect(result).toHaveLength(3);
    });

    it('should not mutate original array', () => {
      const original = [...mockTransactions];
      getRecentTransactions(mockTransactions, 2);

      expect(mockTransactions).toEqual(original);
    });
  });
});
