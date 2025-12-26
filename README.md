# FinanceFlow - Premium Finance Tracker

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.76.5-61dafb.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2053-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6.svg)

A beautiful, feature-rich mobile finance tracker built with React Native and Expo. Track expenses, manage budgets, visualize spending patterns, and sync across devices with real-time cloud backup.

[Features](#features) • [Screenshots](#screenshots) • [Installation](#installation) • [Tech Stack](#tech-stack) • [Contributing](#contributing)

</div>

---

## Features

### 💰 Core Functionality
- **Smart Dashboard** - Real-time overview of your financial health
  - Current month balance with income/expense breakdown
  - Quick stats and daily spending average
  - Recent transactions at a glance
  - Savings goals with visual progress tracking

- **Transaction Management**
  - Add, edit, and delete transactions
  - Swipe-to-delete gesture support
  - Categorize with 15+ pre-defined categories
  - Custom descriptions and notes
  - Receipt image attachments
  - Advanced search and filtering (by type, category, date range)

- **Budget Tracking**
  - Set monthly budgets by category
  - Visual progress indicators
  - Smart budget alerts at 75%, 90%, and 100% thresholds
  - Days until budget reset counter
  - Budget health status (good/warning/danger)

### 📊 Analytics & Insights
- **Multiple Chart Types**
  - Line Chart - 6-month spending trends
  - Pie Chart - Category breakdown with percentages
  - Bar Chart - Monthly comparison
  - Contribution Graph - Daily spending heatmap
- **Top Categories** - Identify biggest spending areas
- **Smart Insights** - Spending patterns and recommendations

### 🚀 Advanced Features
- **Recurring Transactions** - Automate salary, bills, subscriptions
  - Daily, weekly, monthly, yearly frequencies
  - Automatic transaction generation
  - Templates for common recurring items

- **Savings Goals** - Track progress toward financial goals
  - Visual progress bars
  - Target amounts and deadlines
  - Multiple goals support

- **Real-time Cloud Sync** - Firebase integration
  - Automatic sync across devices
  - Offline-first with local storage fallback
  - Secure cloud backup

- **Dark Mode** - Eye-friendly theme switching
- **Multi-Currency Support** - 150+ currencies worldwide
- **Push Notifications** - Budget alerts and reminders
- **Biometric Authentication** - Face ID / Touch ID security

### 🎨 Premium UI/UX
- Clean, minimalist interface with premium gradients
- Smooth animations and transitions
- Haptic feedback for better user experience
- Glassmorphism effects
- Safe area support for all devices
- Accessible design following WCAG guidelines

---

## Screenshots

> Add screenshots here to showcase your app

---

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional but recommended)
- Firebase account (for cloud sync features)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/financeflow.git
cd financeflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase** (for cloud sync)
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config
   - Create a `.env` file based on `.env.example`
   - Add your Firebase credentials to `.env`

4. **Start the development server**
```bash
npm start
```

5. **Run on your device**
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal
   - **Physical Device**: Scan QR code with Expo Go app

### Alternative Commands

```bash
# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

---

## Tech Stack

### Core
- **React Native** (0.76.5) - Mobile framework
- **Expo SDK 53** - Development platform
- **TypeScript** (5.3) - Type safety
- **React Navigation** - Navigation library

### State & Data
- **Zustand** - Lightweight state management
- **Firebase Auth** - Email/password authentication
- **Firestore** - Real-time cloud database
- **AsyncStorage** - Local data persistence

### UI Components & Styling
- **expo-linear-gradient** - Premium gradient backgrounds
- **react-native-chart-kit** - Beautiful charts
- **react-native-svg** - SVG support for charts
- **react-native-gesture-handler** - Swipe gestures
- **react-native-safe-area-context** - Safe area handling

### Utilities
- **date-fns** - Modern date manipulation
- **expo-notifications** - Local & push notifications
- **expo-haptics** - Haptic feedback
- **Expo Image Picker** - Receipt photo uploads

---

## Project Structure

```
FinanceTracker/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── SavingsGoalCard.tsx
│   ├── constants/           # App constants and theme
│   │   ├── categories.ts
│   │   ├── currencies.ts
│   │   └── theme.ts
│   ├── context/             # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── navigation/          # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   └── TabNavigator.tsx
│   ├── screens/             # App screens
│   │   ├── Auth/
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignUpScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   ├── TransactionDetailScreen.tsx
│   │   ├── AddTransactionScreen.tsx
│   │   ├── BudgetScreen.tsx
│   │   ├── AnalyticsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/            # External services
│   │   ├── authService.ts
│   │   └── firestoreService.ts
│   ├── store/               # State management
│   │   └── useStore.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── utils/               # Utility functions
│       ├── formatters.ts
│       ├── notifications.ts
│       ├── budgetAlerts.ts
│       └── recurringProcessor.ts
├── assets/                  # Images, fonts, icons
├── App.tsx                  # Entry point
├── app.json                 # Expo configuration
├── eas.json                 # EAS Build configuration
└── package.json
```

---

## Default Categories

### 💸 Expense Categories
- 🍔 Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 💡 Bills & Utilities
- 💊 Health & Fitness
- 📚 Education
- ✈️ Travel
- 🛒 Groceries
- 📦 Other

### 💵 Income Categories
- 💰 Salary
- 💼 Freelance
- 📈 Investment
- 🎁 Gift
- 💵 Other

---

## Building for Production

### Build APK (Android)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build preview APK
eas build --platform android --profile preview

# Build production APK
eas build --platform android --profile production
```

### Build for iOS

```bash
# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile production
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

See `.env.example` for the template.

---

## Firebase Setup Guide

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
4. Enable **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)
5. Get your config:
   - Go to Project Settings > General
   - Scroll to "Your apps" > Web app
   - Copy the config values to your `.env` file

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Privacy & Security

- All financial data is encrypted in transit and at rest
- Passwords are hashed using Firebase Authentication
- Biometric authentication support for extra security
- Data is scoped per user with Firestore security rules
- No third-party analytics or tracking
- Optional cloud sync (works offline-first)

---

## Roadmap

- [ ] Receipt scanning with OCR
- [ ] Bank account integration
- [ ] Multiple account support
- [ ] Advanced reporting & exports (PDF/CSV)
- [ ] Widgets for iOS/Android home screens
- [ ] Web dashboard
- [ ] Bill reminders & payment tracking
- [ ] Investment portfolio tracking

---

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Design inspired by modern fintech apps
- Icons from Expo vector-icons
- Charts powered by react-native-chart-kit
- Backend by Firebase

---

## Support

If you like this project, please give it a ⭐ on GitHub!

For bugs and feature requests, please [open an issue](https://github.com/yourusername/financeflow/issues).

---

<div align="center">

**Built with ❤️ using React Native and Expo**

[Report Bug](https://github.com/yourusername/financeflow/issues) • [Request Feature](https://github.com/yourusername/financeflow/issues)

</div>
