import { Category } from '../types';

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'cat_food',
    name: 'Food & Dining',
    icon: '🍔',
    color: '#FF6B6B',
    type: 'expense',
  },
  {
    id: 'cat_transport',
    name: 'Transportation',
    icon: '🚗',
    color: '#4ECDC4',
    type: 'expense',
  },
  {
    id: 'cat_shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#95E1D3',
    type: 'expense',
  },
  {
    id: 'cat_entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: '#F38181',
    type: 'expense',
  },
  {
    id: 'cat_bills',
    name: 'Bills & Utilities',
    icon: '💡',
    color: '#AA96DA',
    type: 'expense',
  },
  {
    id: 'cat_health',
    name: 'Health & Fitness',
    icon: '💊',
    color: '#FCBAD3',
    type: 'expense',
  },
  {
    id: 'cat_education',
    name: 'Education',
    icon: '📚',
    color: '#A8D8EA',
    type: 'expense',
  },
  {
    id: 'cat_travel',
    name: 'Travel',
    icon: '✈️',
    color: '#FFD93D',
    type: 'expense',
  },
  {
    id: 'cat_groceries',
    name: 'Groceries',
    icon: '🛒',
    color: '#6BCF7F',
    type: 'expense',
  },
  {
    id: 'cat_other_expense',
    name: 'Other',
    icon: '📦',
    color: '#B8B8D1',
    type: 'expense',
  },
];

// Default income categories
export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  {
    id: 'cat_salary',
    name: 'Salary',
    icon: '💰',
    color: '#2ECC71',
    type: 'income',
  },
  {
    id: 'cat_freelance',
    name: 'Freelance',
    icon: '💼',
    color: '#58D68D',
    type: 'income',
  },
  {
    id: 'cat_investment',
    name: 'Investment',
    icon: '📈',
    color: '#52BE80',
    type: 'income',
  },
  {
    id: 'cat_gift',
    name: 'Gift',
    icon: '🎁',
    color: '#7DCEA0',
    type: 'income',
  },
  {
    id: 'cat_other_income',
    name: 'Other',
    icon: '💵',
    color: '#A9DFBF',
    type: 'income',
  },
];

export const ALL_CATEGORIES = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

// Currency options
export const CURRENCIES = [
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];
