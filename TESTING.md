# Testing Guide

## Overview

This document outlines the testing strategy, setup, and best practices for the FinanceFlow application.

## Test Coverage

### Current Status

✅ **Unit Tests:** 60+ tests covering utilities and services
⚠️ **Component Tests:** In progress
❌ **Integration Tests:** Planned
❌ **E2E Tests:** Future roadmap

**Coverage Metrics:**
- Utilities: ~85% coverage
- Services: ~70% coverage
- Components: ~0% coverage (WIP)
- Overall: ~35% coverage

**Target:** 80% overall code coverage

---

## Testing Stack

### Testing Libraries

```json
{
  "jest": "^29.7.0",
  "jest-expo": "^52.0.4",
  "@testing-library/react-native": "^12.4.3",
  "@testing-library/jest-native": "^5.4.3",
  "react-test-renderer": "19.1.0",
  "@types/jest": "^29.5.12"
}
```

### Configuration Files

- **jest.config.js** - Main Jest configuration
- **jest.setup.js** - Test environment setup and mocks
- **package.json** - Test scripts

---

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test formatters.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="formatCurrency"
```

### CI/CD Integration

Tests run automatically on:
- Every push to master/main/develop
- All pull requests
- Via GitHub Actions workflow

---

## Test Organization

### Directory Structure

```
src/
├── components/
│   └── __tests__/
│       ├── Button.test.tsx
│       └── Card.test.tsx
├── services/
│   └── __tests__/
│       └── authService.test.ts
└── utils/
    └── __tests__/
        ├── formatters.test.ts
        ├── budgetAlerts.test.ts
        └── accessibility.test.ts
```

### Naming Conventions

- **Test files:** `*.test.ts` or `*.test.tsx`
- **Mock files:** `__mocks__/moduleName.ts`
- **Test utilities:** `test-utils.tsx`

---

## Writing Tests

### Unit Tests

**Example: Testing Utility Functions**

```typescript
import { formatCurrency, formatDate } from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-500, 'USD')).toBe('$500.00');
    });

    it('should default to USD', () => {
      expect(formatCurrency(100)).toBe('$100.00');
    });
  });

  describe('formatDate', () => {
    it('should format date with default format', () => {
      const date = new Date('2025-01-15');
      expect(formatDate(date)).toBe('Jan 15, 2025');
    });
  });
});
```

### Component Tests (Future)

**Example: Testing React Components**

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('should render with correct text', () => {
    const { getByText } = render(
      <Button title="Click Me" onPress={() => {}} />
    );
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when tapped', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <Button title="Click Me" onPress={onPressMock} />
    );

    fireEvent.press(getByText('Click Me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByText } = render(
      <Button title="Click Me" onPress={() => {}} disabled />
    );

    const button = getByText('Click Me').parent;
    expect(button).toHaveStyle({ opacity: 0.5 });
  });
});
```

### Integration Tests (Future)

**Example: Testing Store Actions**

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useStore } from '../store/useStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('useStore', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  it('should add transaction and persist to storage', async () => {
    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.addTransaction({
        amount: 100,
        type: 'expense',
        categoryId: 'food',
        description: 'Groceries',
        date: new Date(),
      });
    });

    expect(result.current.transactions).toHaveLength(1);
    expect(result.current.transactions[0].amount).toBe(100);

    // Check persistence
    const stored = await AsyncStorage.getItem('@finance_tracker_transactions');
    expect(stored).toBeTruthy();
  });
});
```

---

## Mocking

### Available Mocks

Located in `jest.setup.js`:

#### AsyncStorage
```typescript
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

#### Firebase
```typescript
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  // ... more mocks
}));
```

#### Expo Modules
```typescript
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
}));
```

### Custom Mocks

**Example: Mocking a Service**

```typescript
// __mocks__/authService.ts
export const signInWithEmail = jest.fn().mockResolvedValue({
  user: { uid: 'test-user-123', email: 'test@example.com' },
});

export const signUpWithEmail = jest.fn().mockResolvedValue({
  user: { uid: 'test-user-123', email: 'test@example.com' },
});

export const logout = jest.fn().mockResolvedValue(undefined);
```

**Usage:**
```typescript
jest.mock('../services/authService');
import { signInWithEmail } from '../services/authService';

it('should call signInWithEmail', async () => {
  await signInWithEmail('test@example.com', 'password123');
  expect(signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
});
```

---

## Testing Best Practices

### General Guidelines

1. **Follow AAA Pattern**
   - **Arrange:** Set up test data and mocks
   - **Act:** Execute the code under test
   - **Assert:** Verify the results

2. **One Assertion Per Test** (when possible)
   - Makes failures easier to debug
   - Clear test intent

3. **Descriptive Test Names**
   ```typescript
   // ❌ Bad
   it('works', () => { ... });

   // ✅ Good
   it('should format currency with comma separators for amounts over 1000', () => { ... });
   ```

4. **Test Edge Cases**
   - Null/undefined values
   - Empty arrays/objects
   - Boundary values
   - Error conditions

5. **Avoid Test Interdependence**
   - Each test should be independent
   - Use `beforeEach` for setup
   - Use `afterEach` for cleanup

### React Native Specific

1. **Use Testing Library Queries**
   ```typescript
   // ✅ Prefer accessible queries
   getByText('Submit')
   getByLabelText('Email input')
   getByRole('button')

   // ⚠️ Avoid implementation details
   getByTestId('submit-button') // Last resort
   ```

2. **Test User Interactions**
   ```typescript
   fireEvent.press(button);
   fireEvent.changeText(input, 'new value');
   ```

3. **Wait for Async Updates**
   ```typescript
   await waitFor(() => {
     expect(getByText('Success')).toBeTruthy();
   });
   ```

---

## Code Coverage

### Coverage Thresholds

Set in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### Coverage Reports

- **Terminal:** Summary in console
- **HTML:** Detailed line-by-line coverage
- **LCOV:** For CI/CD integration
- **Codecov:** Cloud-based tracking (in CI)

---

## Debugging Tests

### Common Issues

#### 1. Module Resolution Errors

```bash
Cannot find module '@/components/Button'
```

**Solution:** Check `jest.config.js` moduleNameMapper

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
},
```

#### 2. Async Timeout Errors

```bash
Timeout - Async callback was not invoked within timeout
```

**Solution:** Increase timeout or use proper async handling

```typescript
it('should handle async operation', async () => {
  await waitFor(() => {
    expect(result).toBeTruthy();
  }, { timeout: 5000 });
}, 10000); // Test timeout
```

#### 3. Act Warnings

```bash
Warning: An update to Component inside a test was not wrapped in act(...)
```

**Solution:** Wrap state updates in `act()`

```typescript
import { act } from '@testing-library/react-native';

act(() => {
  result.current.updateState();
});
```

### Debug Mode

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Use console.log
console.log('Debug value:', value);

# Use debugger statement
debugger;
```

---

## Test Data

### Fixtures

Create reusable test data:

```typescript
// __fixtures__/transactions.ts
export const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    amount: 50.00,
    type: 'expense',
    categoryId: 'food',
    description: 'Groceries',
    date: new Date('2025-01-15'),
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  // ... more fixtures
];
```

### Factories

Generate dynamic test data:

```typescript
// test-utils/factories.ts
export const createMockTransaction = (overrides = {}) => ({
  id: `txn_${Date.now()}`,
  amount: 100,
  type: 'expense',
  categoryId: 'food',
  description: 'Test transaction',
  date: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Usage
const transaction = createMockTransaction({ amount: 200 });
```

---

## Continuous Integration

### GitHub Actions

Tests run on every push and PR:

```yaml
- name: Run tests
  run: npm test -- --coverage --watchAll=false

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

### Pre-commit Hooks

Tests run before commit (optional):

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

---

## Next Steps

### Short Term

1. ✅ Add component tests for Button and Card
2. ✅ Add tests for accessibility utilities
3. ✅ Increase coverage to 60%

### Medium Term

4. Add integration tests for store
5. Add tests for navigation flows
6. Snapshot testing for UI consistency

### Long Term

7. E2E testing with Detox
8. Visual regression testing
9. Performance testing
10. Load testing for Firebase queries

---

## Resources

### Documentation

- [Jest Docs](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Tools

- [Codecov](https://codecov.io/) - Coverage tracking
- [Detox](https://wix.github.io/Detox/) - E2E testing
- [Storybook](https://storybook.js.org/) - Component development

---

## Contributing

When adding new features:

1. ✅ Write tests first (TDD)
2. ✅ Maintain coverage thresholds
3. ✅ Update this guide if needed
4. ✅ Run tests before committing

---

**Last Updated:** December 2025
**Maintainer:** Development Team
