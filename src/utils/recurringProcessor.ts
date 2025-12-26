import { RecurringTransaction, Transaction } from '../types';
import { differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, addDays, addWeeks, addMonths, addYears } from 'date-fns';

// Process recurring transactions and create actual transactions
export const processRecurringTransactions = (
  recurringTransactions: RecurringTransaction[],
  existingTransactions: Transaction[]
): Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] => {
  const newTransactions: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  const now = new Date();

  recurringTransactions.forEach((recurring) => {
    if (!recurring.isActive) return;
    if (recurring.endDate && now > recurring.endDate) return;

    const lastProcessed = recurring.lastProcessed || recurring.startDate;
    let nextDate = getNextDate(lastProcessed, recurring.frequency);

    // Create transactions for all missed dates
    while (nextDate <= now) {
      // Check if we already have a transaction for this recurring item on this date
      const alreadyExists = existingTransactions.some((txn) => {
        const txnDate = typeof txn.date === 'string' ? new Date(txn.date) : txn.date;
        return (
          txn.description.includes(`[Auto: ${recurring.description}]`) &&
          Math.abs(txnDate.getTime() - nextDate.getTime()) < 24 * 60 * 60 * 1000 // Within same day
        );
      });

      if (!alreadyExists) {
        newTransactions.push({
          amount: recurring.amount,
          type: recurring.type,
          category: recurring.category,
          categoryId: recurring.categoryId,
          description: `[Auto: ${recurring.description}]`,
          date: nextDate,
        });
      }

      nextDate = getNextDate(nextDate, recurring.frequency);
    }
  });

  return newTransactions;
};

// Get next date based on frequency
const getNextDate = (date: Date, frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'): Date => {
  switch (frequency) {
    case 'daily':
      return addDays(date, 1);
    case 'weekly':
      return addWeeks(date, 1);
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addYears(date, 1);
  }
};

// Common recurring transaction templates
export const RECURRING_TEMPLATES = [
  {
    name: 'Monthly Salary',
    type: 'income' as const,
    frequency: 'monthly' as const,
    icon: '💰',
  },
  {
    name: 'Rent/Mortgage',
    type: 'expense' as const,
    frequency: 'monthly' as const,
    icon: '🏠',
  },
  {
    name: 'Netflix Subscription',
    type: 'expense' as const,
    frequency: 'monthly' as const,
    icon: '📺',
  },
  {
    name: 'Gym Membership',
    type: 'expense' as const,
    frequency: 'monthly' as const,
    icon: '💪',
  },
  {
    name: 'Phone Bill',
    type: 'expense' as const,
    frequency: 'monthly' as const,
    icon: '📱',
  },
];
