import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Announce message to screen readers
 * @param message Message to announce
 */
export const announceForAccessibility = (message: string): void => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    AccessibilityInfo.announceForAccessibility(message);
  }
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.error('Error checking screen reader status:', error);
    return false;
  }
};

/**
 * Format currency for screen readers
 * @param amount Amount to format
 * @param currency Currency code
 */
export const formatCurrencyForScreenReader = (amount: number, currency: string = 'USD'): string => {
  const formatted = amount.toFixed(2);
  return `${formatted} ${currency}`;
};

/**
 * Format date for screen readers
 * @param date Date to format
 */
export const formatDateForScreenReader = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Create accessible label for transaction
 */
export const createTransactionAccessibilityLabel = (
  type: 'income' | 'expense',
  amount: number,
  category: string,
  date: Date,
  currency: string = 'USD'
): string => {
  const typeText = type === 'income' ? 'Income' : 'Expense';
  const amountText = formatCurrencyForScreenReader(amount, currency);
  const dateText = formatDateForScreenReader(date);

  return `${typeText} of ${amountText} in ${category} category on ${dateText}`;
};

/**
 * Create accessible hint for buttons
 */
export const createButtonHint = (action: string): string => {
  return `Double tap to ${action}`;
};
