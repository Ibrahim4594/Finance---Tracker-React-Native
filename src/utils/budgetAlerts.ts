import { Transaction, Category } from '../types';
import { sendBudgetAlert } from './notifications';

export const checkBudgetAlerts = (
  transactions: Transaction[],
  categories: Category[],
  currency: string
) => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  categories.forEach((category) => {
    if (!category.budgetLimit || category.budgetLimit === 0) return;

    const monthExpenses = transactions.filter((txn) => {
      const txnDate = typeof txn.date === 'string' ? new Date(txn.date) : txn.date;
      return (
        txn.type === 'expense' &&
        txn.categoryId === category.id &&
        txnDate >= monthStart
      );
    });

    const totalSpent = monthExpenses.reduce((sum, txn) => sum + txn.amount, 0);
    const percentage = (totalSpent / category.budgetLimit) * 100;

    // Alert at 75%, 90%, and 100%
    if (percentage >= 100) {
      sendBudgetAlert(category.name, percentage, totalSpent, category.budgetLimit, currency);
    } else if (percentage >= 90) {
      sendBudgetAlert(category.name, percentage, totalSpent, category.budgetLimit, currency);
    } else if (percentage >= 75) {
      sendBudgetAlert(category.name, percentage, totalSpent, category.budgetLimit, currency);
    }
  });
};

// Calculate days until budget resets
export const getDaysUntilReset = (): number => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diff = nextMonth.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Get budget health status
export const getBudgetHealth = (spent: number, limit: number): 'good' | 'warning' | 'danger' => {
  const percentage = (spent / limit) * 100;
  if (percentage >= 90) return 'danger';
  if (percentage >= 75) return 'warning';
  return 'good';
};
