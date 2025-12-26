# Quick Start Guide

## Running Your Finance Tracker App

### Option 1: Start Development Server
```bash
cd FinanceTracker
npm start
```

Then scan the QR code with:
- **iOS**: Camera app or Expo Go app
- **Android**: Expo Go app

### Option 2: Run on Specific Platform
```bash
cd FinanceTracker

# For iOS (Mac only)
npm run ios

# For Android
npm run android

# For Web
npm run web
```

## First Time Setup

When you first run the app:
1. The app will start with no transactions
2. Tap the **+** button to add your first transaction
3. Choose between Income or Expense
4. Enter an amount and select a category
5. Add an optional description
6. Tap Save

## App Features

### Dashboard Tab
- View your current balance
- See income vs expenses for the month
- Check recent transactions
- View quick stats

### Transactions Tab
- View all your transactions
- Filter by All, Expenses, or Income
- Add new transactions with the + button

### Budget Tab
- View your monthly budget overview
- See spending by category
- Track budget progress
- Get spending insights

### Analytics Tab
- See total expenses breakdown
- View spending by category
- Get insights about your spending patterns

### Profile Tab
- Change currency (tap Currency option)
- Toggle dark mode
- Enable/disable notifications
- Manage app settings

## Tips

1. **Add Sample Data**: To see the app in action, add a few transactions with different categories
2. **Set Budgets**: Currently budgets are set via category.budgetLimit - future update will add UI for this
3. **Categories**: The app comes with 10+ pre-defined categories for both income and expenses
4. **Data Storage**: All your data is stored locally on your device

## Troubleshooting

If the app doesn't start:
1. Make sure you're in the `FinanceTracker` directory
2. Clear cache: `npm start --clear`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

## Next Steps

Once you're comfortable with the basic features, you can:
- Customize categories in `src/constants/categories.ts`
- Modify the theme in `src/constants/theme.ts`
- Add more features as needed
- Customize the UI to your preference

Happy tracking!
