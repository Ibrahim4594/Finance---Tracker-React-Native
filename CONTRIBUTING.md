# Contributing to FinanceFlow

Thank you for considering contributing to FinanceFlow! We welcome contributions from everyone.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected to see
- **Include screenshots or GIFs** if relevant
- **Include your environment details:**
  - Device (iPhone 14, Samsung Galaxy S23, etc.)
  - OS version (iOS 17.2, Android 14, etc.)
  - App version
  - Expo Go version (if applicable)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Include mockups or examples** if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Write clear, descriptive commit messages**
4. **Update documentation** as needed
5. **Test your changes thoroughly**
6. **Submit a pull request**

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account

### Setup Steps

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/financeflow.git
   cd financeflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Copy `.env.example` to `.env`
   - Add your Firebase credentials

4. **Start the development server**
   ```bash
   npm start
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type when possible
- Use strict mode

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use functional components and hooks in React

### Naming Conventions

- **Files**: PascalCase for components (`DashboardScreen.tsx`), camelCase for utilities (`formatters.ts`)
- **Components**: PascalCase (`SavingsGoalCard`)
- **Functions**: camelCase (`calculateMonthlyStats`)
- **Constants**: SCREAMING_SNAKE_CASE (`STORAGE_KEYS`)
- **Types/Interfaces**: PascalCase (`Transaction`, `SavingsGoal`)

### File Organization

```
src/
├── components/      # Reusable UI components
├── constants/       # App constants and configuration
├── context/         # React Context providers
├── navigation/      # Navigation setup
├── screens/         # Screen components
├── services/        # External services (Firebase, etc.)
├── store/           # State management
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Commit Messages

Write clear and meaningful commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests when relevant

**Examples:**
```
Add savings goals feature
Fix currency display bug in transactions
Update README with Firebase setup instructions
Refactor budget calculation logic
```

## Testing

Before submitting a pull request:

1. **Test on both iOS and Android** if possible
2. **Test with different screen sizes**
3. **Test offline functionality**
4. **Verify Firebase sync** is working
5. **Check for console errors/warnings**

## Pull Request Process

1. **Update the README.md** with details of changes if needed
2. **Update the version number** following [Semantic Versioning](https://semver.org/)
3. **Ensure all tests pass** and there are no linting errors
4. **Request review** from maintainers
5. **Address review comments** promptly

### PR Title Format

Use conventional commits format:

- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update documentation`
- `style: Format code`
- `refactor: Refactor module`
- `test: Add tests`
- `chore: Update dependencies`

## Feature Requests

We use GitHub Issues to track feature requests. Before submitting:

1. **Check existing issues** to avoid duplicates
2. **Provide context** on why the feature is useful
3. **Include examples** or mockups if possible
4. **Be open to discussion** and feedback

## Questions?

Feel free to:

- Open a GitHub issue
- Start a discussion in the Discussions tab
- Reach out to maintainers

## Recognition

Contributors will be recognized in the README and release notes.

---

Thank you for contributing to FinanceFlow! 🎉
