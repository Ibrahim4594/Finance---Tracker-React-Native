import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import {
  formatCurrency,
  getCurrentMonthKey,
  calculateMonthlyStats,
  calculateSpendingByCategory,
} from '../utils/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, categories, budgets, settings } = useStore();

  const currentMonthKey = getCurrentMonthKey();
  const monthlyStats = calculateMonthlyStats(transactions);
  const spendingByCategory = calculateSpendingByCategory(transactions, categories);

  const currentBudget = budgets.find((b) => b.month === currentMonthKey);

  // Calculate total budget from category budgets or use default
  const totalBudget = currentBudget?.totalBudget || 0;
  const totalSpent = monthlyStats.totalExpenses;
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Get category budgets with spending
  const categoryBudgets = useMemo(() => {
    const expenseCategories = categories.filter((cat) => cat.type === 'expense');

    return expenseCategories.map((category) => {
      const spending = spendingByCategory.find((s) => s.categoryId === category.id);
      const spent = spending?.amount || 0;
      const budgetLimit = category.budgetLimit || 0;
      const percentage = budgetLimit > 0 ? (spent / budgetLimit) * 100 : 0;

      return {
        ...category,
        spent,
        budgetLimit,
        percentage,
        remaining: budgetLimit - spent,
      };
    });
  }, [categories, spendingByCategory]);

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return COLORS.success;
    if (percentage < 80) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
        style={[styles.headerGradient, { paddingTop: insets.top + SPACING.md }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Budget</Text>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>◈</Text>
          </View>
        </View>

        {/* Overall Budget Display */}
        <View style={styles.budgetDisplay}>
          <Text style={styles.budgetLabel}>MONTHLY BUDGET</Text>
          <Text style={styles.budgetAmount}>
            {formatCurrency(totalBudget, settings.currency)}
          </Text>
          <Text style={styles.budgetPercentage}>{Math.round(percentageUsed)}% used</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(percentageUsed, 100)}%`,
                  backgroundColor: percentageUsed > 80 ? COLORS.error : COLORS.accent,
                },
              ]}
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsCards}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Text style={styles.statIcon}>↑</Text>
            </View>
            <View>
              <Text style={styles.statCardLabel}>Spent</Text>
              <Text style={styles.statCardValue}>
                {formatCurrency(totalSpent, settings.currency)}
              </Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Text style={styles.statIcon}>◎</Text>
            </View>
            <View>
              <Text style={styles.statCardLabel}>Remaining</Text>
              <Text style={[
                styles.statCardValue,
                { color: remaining >= 0 ? COLORS.textInverse : COLORS.errorLight }
              ]}>
                {formatCurrency(remaining, settings.currency)}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Budgets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category Budgets</Text>
            <TouchableOpacity>
              <Text style={styles.editButton}>Edit →</Text>
            </TouchableOpacity>
          </View>

          {categoryBudgets.filter((cat) => cat.budgetLimit > 0).length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIconText}>◈</Text>
              </View>
              <Text style={styles.emptyText}>No budgets set</Text>
              <Text style={styles.emptySubtext}>
                Set category budgets to track your spending
              </Text>
            </View>
          ) : (
            categoryBudgets
              .filter((cat) => cat.budgetLimit > 0)
              .sort((a, b) => b.spent - a.spent)
              .map((categoryBudget) => (
                <View key={categoryBudget.id} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryIcon, { backgroundColor: COLORS.backgroundDark }]}>
                        <Text style={styles.categoryIconText}>{categoryBudget.icon}</Text>
                      </View>
                      <View>
                        <Text style={styles.categoryName}>{categoryBudget.name}</Text>
                        <Text style={styles.categoryBudgetText}>
                          {formatCurrency(categoryBudget.spent, settings.currency)} /{' '}
                          {formatCurrency(categoryBudget.budgetLimit, settings.currency)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.categoryRight}>
                      <Text
                        style={[
                          styles.percentageText,
                          { color: getProgressColor(categoryBudget.percentage) },
                        ]}
                      >
                        {Math.round(categoryBudget.percentage)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.categoryProgressBar}>
                    <View
                      style={[
                        styles.categoryProgressFill,
                        {
                          width: `${Math.min(categoryBudget.percentage, 100)}%`,
                          backgroundColor: getProgressColor(categoryBudget.percentage),
                        },
                      ]}
                    />
                  </View>

                  {categoryBudget.remaining < 0 && (
                    <Text style={styles.overBudgetText}>
                      Over budget by{' '}
                      {formatCurrency(Math.abs(categoryBudget.remaining), settings.currency)}
                    </Text>
                  )}
                </View>
              ))
          )}
        </View>

        {/* Spending Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>

          <View style={styles.insightCard}>
            <View style={[styles.insightIconContainer, { backgroundColor: `${COLORS.accent}15` }]}>
              <Text style={styles.insightIconText}>◐</Text>
            </View>
            <Text style={styles.insightText}>
              {percentageUsed < 50
                ? "You're on track with your budget this month."
                : percentageUsed < 80
                ? "You've used most of your budget. Watch your spending!"
                : percentageUsed < 100
                ? 'Almost at your budget limit.'
                : "You've exceeded your budget this month."}
            </Text>
          </View>

          <View style={styles.insightCard}>
            <View style={[styles.insightIconContainer, { backgroundColor: `${COLORS.secondary}15` }]}>
              <Text style={[styles.insightIconText, { color: COLORS.secondary }]}>◎</Text>
            </View>
            <Text style={styles.insightText}>
              Average daily spending:{' '}
              <Text style={styles.insightHighlight}>
                {formatCurrency(monthlyStats.averageDaily, settings.currency)}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
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
  title: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textInverse,
    letterSpacing: -0.5,
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
  budgetDisplay: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  budgetLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 1.5,
    marginBottom: SPACING.xs,
  },
  budgetAmount: {
    fontSize: 44,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textInverse,
    letterSpacing: -1,
  },
  budgetPercentage: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: SPACING.xs,
  },
  progressBarContainer: {
    marginBottom: SPACING.lg,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
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
  editButton: {
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
    paddingHorizontal: SPACING.lg,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  categoryIconText: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    marginBottom: 2,
  },
  categoryBudgetText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  overBudgetText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weightMedium,
    marginTop: SPACING.xs,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  insightIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  insightIconText: {
    fontSize: 20,
    color: COLORS.accent,
  },
  insightText: {
    flex: 1,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  insightHighlight: {
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.accent,
  },
});
