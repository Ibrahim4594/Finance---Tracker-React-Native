import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, SavingsGoal } from '../types';
import { useStore } from '../store/useStore';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import {
  formatCurrency,
  calculateMonthlyStats,
  getRecentTransactions,
  formatDate,
} from '../utils/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SavingsGoalCard from '../components/SavingsGoalCard';
import { checkBudgetAlerts, getDaysUntilReset } from '../utils/budgetAlerts';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { transactions, categories, settings, loadData } = useStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const monthlyStats = calculateMonthlyStats(transactions);
  const recentTransactions = getRecentTransactions(transactions, 5);

  // Demo Savings Goals
  const [savingsGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      currentAmount: 3500,
      icon: '🛡️',
      color: COLORS.success,
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Vacation',
      targetAmount: 2000,
      currentAmount: 1200,
      deadline: new Date(2025, 11, 31),
      icon: '✈️',
      color: COLORS.accent,
      createdAt: new Date(),
    },
  ]);

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.icon || '●';
  };

  // Check budget alerts
  useEffect(() => {
    if (transactions.length > 0) {
      checkBudgetAlerts(transactions, categories, settings.currency);
    }
  }, [transactions.length]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
        style={[styles.headerGradient, { paddingTop: insets.top + SPACING.md }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.date}>{formatDate(new Date(), 'EEEE, MMMM dd')}</Text>
          </View>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>◎</Text>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(monthlyStats.balance, settings.currency)}
          </Text>
        </View>

        {/* Income/Expense Cards */}
        <View style={styles.statsCards}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>↓</Text>
            </View>
            <View>
              <Text style={styles.statCardLabel}>Income</Text>
              <Text style={styles.statCardValue}>
                {formatCurrency(monthlyStats.totalIncome, settings.currency)}
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, styles.expenseIcon]}>
              <Text style={styles.statIcon}>↑</Text>
            </View>
            <View>
              <Text style={styles.statCardLabel}>Expenses</Text>
              <Text style={styles.statCardValue}>
                {formatCurrency(monthlyStats.totalExpenses, settings.currency)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatCard}>
            <View style={styles.quickStatIconContainer}>
              <Text style={styles.quickStatIconText}>◈</Text>
            </View>
            <Text style={styles.quickStatValue}>{monthlyStats.transactionCount}</Text>
            <Text style={styles.quickStatLabel}>Transactions</Text>
          </View>

          <View style={styles.quickStatCard}>
            <View style={styles.quickStatIconContainer}>
              <Text style={styles.quickStatIconText}>◐</Text>
            </View>
            <Text style={styles.quickStatValue}>
              {formatCurrency(monthlyStats.averageDaily, settings.currency)}
            </Text>
            <Text style={styles.quickStatLabel}>Daily Average</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIconText}>◎</Text>
              </View>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first transaction</Text>
            </View>
          ) : (
            recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionLeft}>
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor:
                          transaction.type === 'income'
                            ? 'rgba(16, 185, 129, 0.1)'
                            : 'rgba(239, 68, 68, 0.1)',
                      },
                    ]}
                  >
                    <Text style={[
                      styles.transactionIconText,
                      { color: transaction.type === 'income' ? COLORS.success : COLORS.error }
                    ]}>
                      {transaction.type === 'income' ? '↓' : '↑'}
                    </Text>
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCategory}>
                      {getCategoryName(transaction.categoryId)}
                    </Text>
                    <Text style={styles.transactionDescription} numberOfLines={1}>
                      {transaction.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color: transaction.type === 'income' ? COLORS.success : COLORS.error,
                      },
                    ]}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, settings.currency)}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date, 'MMM dd')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Savings Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Savings Goals</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Manage →</Text>
            </TouchableOpacity>
          </View>
          {savingsGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              currency={settings.currency}
              onPress={() => Alert.alert('Coming Soon', 'Goal management feature coming soon!')}
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => navigation.navigate('AddTransaction', {})}
        activeOpacity={0.9}
      >
        <View style={styles.fabInner}>
          <Text style={styles.fabIcon}>+</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textInverse,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.xs,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerIconText: {
    fontSize: 20,
    color: COLORS.accent,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  balanceAmount: {
    fontSize: 44,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textInverse,
    letterSpacing: -1,
  },
  statsCards: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  expenseIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statIcon: {
    fontSize: 18,
    color: COLORS.textInverse,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  statCardLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
  },
  statCardValue: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.textInverse,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  quickStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    marginTop: -SPACING.md,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  quickStatIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickStatIconText: {
    fontSize: 20,
    color: COLORS.accent,
  },
  quickStatValue: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
    marginBottom: SPACING.xxs,
  },
  quickStatLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.weightMedium,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyIconText: {
    fontSize: 28,
    color: COLORS.textLight,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  transactionIconText: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightBold,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    ...SHADOWS.large,
  },
  fabInner: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weightBold,
  },
});
