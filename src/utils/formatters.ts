import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Transaction, MonthlyStats, SpendingByCategory, Category } from '../types';
import { CURRENCIES } from '../constants/categories';

// Format currency
export const formatCurrency = (amount: number, currencyCode: string = 'USD'): string => {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol || '$';

  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${symbol}${formatted}`;
};

// Format date
export const formatDate = (date: Date | string, formatString: string = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString);
};

// Get current month key (e.g., "2025-01")
export const getCurrentMonthKey = (): string => {
  return format(new Date(), 'yyyy-MM');
};

// Get month key from date
export const getMonthKey = (date: Date): string => {
  return format(date, 'yyyy-MM');
};

// Calculate monthly statistics
export const calculateMonthlyStats = (
  transactions: Transaction[],
  monthKey?: string
): MonthlyStats => {
  const targetMonth = monthKey || getCurrentMonthKey();
  const [year, month] = targetMonth.split('-').map(Number);

  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const monthTransactions = transactions.filter((txn) => {
    const txnDate = typeof txn.date === 'string' ? new Date(txn.date) : txn.date;
    return isWithinInterval(txnDate, { start: monthStart, end: monthEnd });
  });

  const totalIncome = monthTransactions
    .filter((txn) => txn.type === 'income')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalExpenses = monthTransactions
    .filter((txn) => txn.type === 'expense')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const balance = totalIncome - totalExpenses;
  const transactionCount = monthTransactions.length;
  const daysInMonth = monthEnd.getDate();
  const averageDaily = totalExpenses / daysInMonth;

  return {
    totalIncome,
    totalExpenses,
    balance,
    transactionCount,
    averageDaily,
  };
};

// Calculate spending by category
export const calculateSpendingByCategory = (
  transactions: Transaction[],
  categories: Category[],
  monthKey?: string
): SpendingByCategory[] => {
  const targetMonth = monthKey || getCurrentMonthKey();
  const [year, month] = targetMonth.split('-').map(Number);

  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const monthExpenses = transactions.filter((txn) => {
    const txnDate = typeof txn.date === 'string' ? new Date(txn.date) : txn.date;
    return (
      txn.type === 'expense' &&
      isWithinInterval(txnDate, { start: monthStart, end: monthEnd })
    );
  });

  const totalExpenses = monthExpenses.reduce((sum, txn) => sum + txn.amount, 0);

  const categorySpending = categories
    .filter((cat) => cat.type === 'expense')
    .map((category) => {
      const amount = monthExpenses
        .filter((txn) => txn.categoryId === category.id)
        .reduce((sum, txn) => sum + txn.amount, 0);

      return {
        categoryId: category.id,
        categoryName: category.name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: category.color,
      };
    })
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return categorySpending;
};

// Get transactions for current month
export const getCurrentMonthTransactions = (transactions: Transaction[]): Transaction[] => {
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  return transactions.filter((txn) => {
    const txnDate = typeof txn.date === 'string' ? new Date(txn.date) : txn.date;
    return isWithinInterval(txnDate, { start: monthStart, end: monthEnd });
  });
};

// Get recent transactions
export const getRecentTransactions = (
  transactions: Transaction[],
  limit: number = 5
): Transaction[] => {
  return [...transactions]
    .sort((a, b) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
      const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, limit);
};
