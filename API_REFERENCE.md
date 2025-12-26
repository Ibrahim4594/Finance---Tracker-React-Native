# API Reference

## Overview

This document provides comprehensive API documentation for all services, utilities, and hooks in the FinanceFlow application.

---

## Services

### Authentication Service (`authService.ts`)

Handles Firebase authentication operations.

#### `signUpWithEmail(email, password, displayName?)`

Creates a new user account with email and password.

**Parameters:**
- `email` (string): User's email address
- `password` (string): User's password (min 6 characters)
- `displayName` (string, optional): User's display name

**Returns:** `Promise<UserCredential>`

**Throws:**
- `auth/email-already-in-use`: Email is already registered
- `auth/invalid-email`: Invalid email format
- `auth/weak-password`: Password too weak

**Example:**
```typescript
try {
  const userCredential = await signUpWithEmail(
    'user@example.com',
    'securePassword123',
    'John Doe'
  );
  console.log('User ID:', userCredential.user.uid);
} catch (error) {
  console.error('Signup failed:', error);
}
```

---

#### `signInWithEmail(email, password)`

Signs in an existing user.

**Parameters:**
- `email` (string): User's email
- `password` (string): User's password

**Returns:** `Promise<UserCredential>`

**Throws:**
- `auth/user-not-found`: No account with this email
- `auth/wrong-password`: Incorrect password
- `auth/invalid-credential`: Invalid credentials

**Example:**
```typescript
const user = await signInWithEmail('user@example.com', 'password123');
```

---

#### `logout()`

Signs out the current user.

**Returns:** `Promise<void>`

**Example:**
```typescript
await logout();
```

---

#### `resetPassword(email)`

Sends password reset email.

**Parameters:**
- `email` (string): User's email address

**Returns:** `Promise<void>`

**Example:**
```typescript
await resetPassword('user@example.com');
Alert.alert('Success', 'Password reset email sent');
```

---

#### `getCurrentUser()`

Gets the currently authenticated user.

**Returns:** `User | null`

**Example:**
```typescript
const currentUser = getCurrentUser();
if (currentUser) {
  console.log('User ID:', currentUser.uid);
}
```

---

#### `getAuthErrorMessage(errorCode)`

Converts Firebase error codes to user-friendly messages.

**Parameters:**
- `errorCode` (string): Firebase auth error code

**Returns:** `string`

**Example:**
```typescript
try {
  await signInWithEmail(email, password);
} catch (error: any) {
  const message = getAuthErrorMessage(error.code);
  Alert.alert('Error', message);
}
```

---

### Firestore Service (`firestoreService.ts`)

Manages Firestore database operations.

#### `syncTransaction(userId, transaction)`

Syncs a transaction to Firestore.

**Parameters:**
- `userId` (string): User's Firebase UID
- `transaction` (Transaction): Transaction object

**Returns:** `Promise<void>`

**Example:**
```typescript
await syncTransaction('user123', {
  id: 'txn_1',
  amount: 100,
  type: 'expense',
  categoryId: 'food',
  description: 'Groceries',
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

---

#### `getTransactions(userId)`

Fetches all transactions for a user.

**Parameters:**
- `userId` (string): User's Firebase UID

**Returns:** `Promise<Transaction[]>`

**Example:**
```typescript
const transactions = await getTransactions('user123');
console.log(`Found ${transactions.length} transactions`);
```

---

#### `deleteTransaction(userId, transactionId)`

Deletes a transaction from Firestore.

**Parameters:**
- `userId` (string): User's Firebase UID
- `transactionId` (string): Transaction ID to delete

**Returns:** `Promise<void>`

**Example:**
```typescript
await deleteTransaction('user123', 'txn_1');
```

---

#### `subscribeToTransactions(userId, callback)`

Sets up real-time listener for transactions.

**Parameters:**
- `userId` (string): User's Firebase UID
- `callback` (Function): Callback receiving Transaction[]

**Returns:** `Unsubscribe` function

**Example:**
```typescript
const unsubscribe = subscribeToTransactions('user123', (transactions) => {
  console.log('Transactions updated:', transactions.length);
});

// Later, cleanup
unsubscribe();
```

---

## Utilities

### Formatters (`formatters.ts`)

#### `formatCurrency(amount, currencyCode)`

Formats a number as currency.

**Parameters:**
- `amount` (number): Amount to format
- `currencyCode` (string): Currency code (default: 'USD')

**Returns:** `string`

**Example:**
```typescript
formatCurrency(1234.56, 'USD');  // "$1,234.56"
formatCurrency(999.99, 'EUR');   // "€999.99"
formatCurrency(-50, 'USD');      // "$50.00" (absolute value)
```

---

#### `formatDate(date, formatString?)`

Formats a date using date-fns.

**Parameters:**
- `date` (Date | string): Date to format
- `formatString` (string): Format pattern (default: 'MMM dd, yyyy')

**Returns:** `string`

**Example:**
```typescript
formatDate(new Date('2025-01-15'));           // "Jan 15, 2025"
formatDate('2025-12-25', 'yyyy-MM-dd');      // "2025-12-25"
formatDate(new Date(), 'EEEE, MMMM dd');     // "Monday, January 15"
```

---

#### `calculateMonthlyStats(transactions, monthKey?)`

Calculates financial statistics for a month.

**Parameters:**
- `transactions` (Transaction[]): Array of transactions
- `monthKey` (string, optional): Month key (e.g., "2025-01")

**Returns:** `MonthlyStats`
```typescript
{
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  averageDaily: number;
}
```

**Example:**
```typescript
const stats = calculateMonthlyStats(transactions, '2025-01');
console.log(`Balance: ${stats.balance}`);
console.log(`Daily average: ${stats.averageDaily}`);
```

---

#### `calculateSpendingByCategory(transactions, categories, monthKey?)`

Breaks down spending by category.

**Parameters:**
- `transactions` (Transaction[]): Transaction array
- `categories` (Category[]): Category array
- `monthKey` (string, optional): Month to analyze

**Returns:** `SpendingByCategory[]`
```typescript
{
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}[]
```

**Example:**
```typescript
const breakdown = calculateSpendingByCategory(
  transactions,
  categories,
  '2025-01'
);

breakdown.forEach(item => {
  console.log(`${item.categoryName}: $${item.amount} (${item.percentage}%)`);
});
```

---

### Budget Alerts (`budgetAlerts.ts`)

#### `getDaysUntilReset()`

Calculates days until next month.

**Returns:** `number`

**Example:**
```typescript
const days = getDaysUntilReset();
console.log(`Budget resets in ${days} days`);
```

---

#### `getBudgetHealth(spent, limit)`

Determines budget health status.

**Parameters:**
- `spent` (number): Amount spent
- `limit` (number): Budget limit

**Returns:** `'good' | 'warning' | 'danger'`

**Logic:**
- `good`: < 75% of limit
- `warning`: 75-89% of limit
- `danger`: >= 90% of limit

**Example:**
```typescript
const health = getBudgetHealth(750, 1000);  // "warning"

if (health === 'danger') {
  Alert.alert('Warning', 'You are over budget!');
}
```

---

### Biometric Authentication (`biometricAuth.ts`)

#### `isBiometricAvailable()`

Checks if biometrics are available.

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const available = await isBiometricAvailable();
if (available) {
  // Show biometric option
}
```

---

#### `getBiometricType()`

Gets the biometric type available.

**Returns:** `Promise<'Face ID' | 'Touch ID' | 'Iris' | 'Biometric'>`

**Example:**
```typescript
const type = await getBiometricType();
console.log(`Device supports: ${type}`);
```

---

#### `authenticateWithBiometrics()`

Prompts biometric authentication.

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const authenticated = await authenticateWithBiometrics();
if (authenticated) {
  // Grant access
} else {
  // Authentication failed
}
```

---

### Accessibility (`accessibility.ts`)

#### `announceForAccessibility(message)`

Announces a message to screen readers.

**Parameters:**
- `message` (string): Message to announce

**Returns:** `void`

**Example:**
```typescript
announceForAccessibility('Transaction saved successfully');
```

---

#### `isScreenReaderEnabled()`

Checks if screen reader is active.

**Returns:** `Promise<boolean>`

**Example:**
```typescript
const enabled = await isScreenReaderEnabled();
if (enabled) {
  // Provide extra accessibility features
}
```

---

#### `createTransactionAccessibilityLabel(type, amount, category, date, currency)`

Creates accessible label for transactions.

**Parameters:**
- `type` ('income' | 'expense'): Transaction type
- `amount` (number): Transaction amount
- `category` (string): Category name
- `date` (Date): Transaction date
- `currency` (string): Currency code

**Returns:** `string`

**Example:**
```typescript
const label = createTransactionAccessibilityLabel(
  'expense',
  50.00,
  'Groceries',
  new Date('2025-01-15'),
  'USD'
);
// "Expense of 50.00 USD in Groceries category on Wednesday, January 15, 2025"
```

---

## Hooks

### `useDebounce<T>(value, delay)`

Debounces a value change.

**Parameters:**
- `value` (T): Value to debounce
- `delay` (number): Delay in ms (default: 500)

**Returns:** `T` (debounced value)

**Example:**
```typescript
function SearchScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    // API call only fires 300ms after user stops typing
    fetchResults(debouncedSearch);
  }, [debouncedSearch]);

  return <TextInput value={searchTerm} onChangeText={setSearchTerm} />;
}
```

---

### `useThemedStyles(createStyles)`

Creates themed styles dynamically.

**Parameters:**
- `createStyles` (Function): Function receiving colors, returning StyleSheet

**Returns:** `StyleSheet`

**Example:**
```typescript
import { useThemedStyles, SPACING } from '../hooks/useThemedStyles';

function MyComponent() {
  const styles = useThemedStyles((colors) =>
    StyleSheet.create({
      container: {
        backgroundColor: colors.background,
        padding: SPACING.md,
      },
      text: {
        color: colors.text,
      },
    })
  );

  return <View style={styles.container}>...</View>;
}
```

---

## Zustand Store

### State Shape

```typescript
{
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: UserSettings;
  savingsGoals: SavingsGoal[];
  recurringTransactions: RecurringTransaction[];
  userId: string | null;
  isOnline: boolean;
  isSyncing: boolean;
}
```

### Actions

#### `addTransaction(transactionData)`

Adds a new transaction.

**Parameters:**
```typescript
{
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: Date;
}
```

**Example:**
```typescript
const { addTransaction } = useStore();

addTransaction({
  amount: 100,
  type: 'expense',
  categoryId: 'food',
  description: 'Lunch',
  date: new Date(),
});
```

---

#### `addSavingsGoal(goalData)`

Adds a savings goal.

**Parameters:**
```typescript
{
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  icon: string;
  color: string;
}
```

**Example:**
```typescript
const { addSavingsGoal } = useStore();

addSavingsGoal({
  name: 'Vacation Fund',
  targetAmount: 5000,
  currentAmount: 1200,
  deadline: new Date('2025-12-31'),
  icon: '✈️',
  color: '#4ECDC4',
});
```

---

#### `updateSettings(updates)`

Updates user settings.

**Parameters:**
```typescript
{
  currency?: string;
  darkMode?: boolean;
  biometricEnabled?: boolean;
  notifications?: boolean;
}
```

**Example:**
```typescript
const { updateSettings } = useStore();

updateSettings({
  darkMode: true,
  notifications: true,
});
```

---

## Error Codes

### Firebase Authentication Errors

| Code | User Message |
|------|-------------|
| `auth/email-already-in-use` | "This email is already registered. Please sign in instead." |
| `auth/invalid-email` | "Invalid email address." |
| `auth/weak-password` | "Password is too weak. Please use at least 6 characters." |
| `auth/user-not-found` | "No account found with this email." |
| `auth/wrong-password` | "Incorrect password." |
| `auth/invalid-credential` | "Invalid email or password." |
| `auth/too-many-requests` | "Too many failed attempts. Please try again later." |
| `auth/network-request-failed` | "Network error. Please check your internet connection." |

---

## Constants

### Available Currencies

```typescript
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  // ... 150+ more
];
```

### Default Categories

**Expense Categories:**
- Food & Dining 🍔
- Transportation 🚗
- Shopping 🛍️
- Entertainment 🎬
- Bills & Utilities 💡
- Health & Fitness 💊
- Education 📚
- Travel ✈️
- Groceries 🛒
- Other 📦

**Income Categories:**
- Salary 💰
- Freelance 💼
- Investment 📈
- Gift 🎁
- Other 💵

---

## Best Practices

### Error Handling

Always wrap async calls in try-catch:

```typescript
try {
  await signInWithEmail(email, password);
} catch (error: any) {
  const message = getAuthErrorMessage(error.code);
  Alert.alert('Error', message);
}
```

### Date Handling

Always parse dates from Firestore:

```typescript
const transaction = await getTransaction(id);
const date = typeof transaction.date === 'string'
  ? new Date(transaction.date)
  : transaction.date;
```

### Cleanup Subscriptions

Always unsubscribe from real-time listeners:

```typescript
useEffect(() => {
  const unsubscribe = subscribeToTransactions(userId, callback);

  return () => {
    unsubscribe();
  };
}, [userId]);
```

---

## TypeScript Types

All types are available in `src/types/index.ts`:

```typescript
import type {
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  RecurringTransaction,
  UserSettings,
  MonthlyStats,
  SpendingByCategory,
} from '../types';
```

---

**Last Updated:** December 2025
**Version:** 1.0.0
