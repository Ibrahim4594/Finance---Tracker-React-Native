import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart, PieChart, ContributionGraph } from 'react-native-chart-kit';
import { useStore } from '../store/useStore';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import {
  formatCurrency,
  calculateSpendingByCategory,
  getCurrentMonthKey,
} from '../utils/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

type ChartView = 'trend' | 'category' | 'monthly' | 'daily';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, categories, settings } = useStore();
  const [selectedView, setSelectedView] = useState<ChartView>('trend');

  // Calculate spending data
  const spendingByCategory = calculateSpendingByCategory(
    transactions,
    categories,
    getCurrentMonthKey()
  );

  const totalExpenses = spendingByCategory.reduce((sum, item) => sum + item.amount, 0);

  // Get last 6 months of data for trend chart
  const last6MonthsData = useMemo(() => {
    const months = [];
    const monthlyExpenses = [];

    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthLabel = format(date, 'MMM');

      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      const monthTxns = transactions.filter((txn) => {
        const txnDate = typeof txn.date === 'string' ? new Date(txn.date) : txn.date;
        return txn.type === 'expense' && txnDate >= monthStart && txnDate <= monthEnd;
      });

      const total = monthTxns.reduce((sum, txn) => sum + txn.amount, 0);

      months.push(monthLabel);
      monthlyExpenses.push(total);
    }

    return { months, monthlyExpenses };
  }, [transactions]);

  // Get daily spending for current month
  const dailySpendingData = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const dailyData = daysInMonth.map((day) => {
      const dayTxns = transactions.filter((txn) => {
        const txnDate = typeof txn.date === 'string' ? new Date(txn.date) : txn.date;
        return (
          txn.type === 'expense' &&
          format(txnDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
      });

      return {
        date: format(day, 'yyyy-MM-dd'),
        count: dayTxns.length,
      };
    });

    return dailyData;
  }, [transactions]);

  // Pie chart data
  const pieChartData = spendingByCategory.slice(0, 6).map((item) => ({
    name: item.categoryName,
    amount: item.amount,
    color: item.color,
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: COLORS.primary,
    backgroundGradientFrom: COLORS.gradientStart,
    backgroundGradientTo: COLORS.gradientMiddle,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(201, 162, 39, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: RADIUS.lg,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: COLORS.accent,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(255, 255, 255, 0.1)',
    },
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
          <Text style={styles.title}>Analytics</Text>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>◐</Text>
          </View>
        </View>

        {/* Total Display */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Expenses This Month</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(totalExpenses, settings.currency)}
          </Text>
          <View style={styles.transactionCount}>
            <Text style={styles.transactionCountText}>
              {transactions.filter(t => t.type === 'expense').length} transactions
            </Text>
          </View>
        </View>

        {/* Chart Type Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartSelector}>
          <TouchableOpacity
            style={[styles.chartTab, selectedView === 'trend' && styles.chartTabActive]}
            onPress={() => setSelectedView('trend')}
          >
            <Text style={[styles.chartTabText, selectedView === 'trend' && styles.chartTabTextActive]}>
              📈 Trend
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chartTab, selectedView === 'category' && styles.chartTabActive]}
            onPress={() => setSelectedView('category')}
          >
            <Text style={[styles.chartTabText, selectedView === 'category' && styles.chartTabTextActive]}>
              🥧 Category
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chartTab, selectedView === 'monthly' && styles.chartTabActive]}
            onPress={() => setSelectedView('monthly')}
          >
            <Text style={[styles.chartTabText, selectedView === 'monthly' && styles.chartTabTextActive]}>
              📊 Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.chartTab, selectedView === 'daily' && styles.chartTabActive]}
            onPress={() => setSelectedView('daily')}
          >
            <Text style={[styles.chartTabText, selectedView === 'daily' && styles.chartTabTextActive]}>
              📅 Daily
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Chart Display */}
        <View style={styles.chartContainer}>
          {selectedView === 'trend' && (
            <View style={styles.chart}>
              <Text style={styles.chartTitle}>6-Month Spending Trend</Text>
              {last6MonthsData.monthlyExpenses.some(val => val > 0) ? (
                <LineChart
                  data={{
                    labels: last6MonthsData.months,
                    datasets: [{
                      data: last6MonthsData.monthlyExpenses.length > 0
                        ? last6MonthsData.monthlyExpenses
                        : [0],
                    }],
                  }}
                  width={screenWidth - SPACING.lg * 2}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chartStyle}
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No expense data yet</Text>
                </View>
              )}
            </View>
          )}

          {selectedView === 'category' && (
            <View style={styles.chart}>
              <Text style={styles.chartTitle}>Spending by Category</Text>
              {pieChartData.length > 0 ? (
                <PieChart
                  data={pieChartData}
                  width={screenWidth - SPACING.lg * 2}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  style={styles.chartStyle}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No category data yet</Text>
                </View>
              )}
            </View>
          )}

          {selectedView === 'monthly' && (
            <View style={styles.chart}>
              <Text style={styles.chartTitle}>Monthly Comparison</Text>
              {last6MonthsData.monthlyExpenses.some(val => val > 0) ? (
                <BarChart
                  data={{
                    labels: last6MonthsData.months,
                    datasets: [{
                      data: last6MonthsData.monthlyExpenses.length > 0
                        ? last6MonthsData.monthlyExpenses
                        : [0],
                    }],
                  }}
                  width={screenWidth - SPACING.lg * 2}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chartStyle}
                  showValuesOnTopOfBars={true}
                  fromZero={true}
                  withInnerLines={false}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No monthly data yet</Text>
                </View>
              )}
            </View>
          )}

          {selectedView === 'daily' && (
            <View style={styles.chart}>
              <Text style={styles.chartTitle}>Daily Activity Heatmap</Text>
              <Text style={styles.chartSubtitle}>Current Month</Text>
              {dailySpendingData.length > 0 ? (
                <ContributionGraph
                  values={dailySpendingData}
                  endDate={new Date()}
                  numDays={30}
                  width={screenWidth - SPACING.lg * 2}
                  height={220}
                  chartConfig={chartConfig}
                  style={styles.chartStyle}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No daily data yet</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>

          {spendingByCategory.length > 0 ? (
            spendingByCategory.map((item) => (
              <View key={item.categoryId} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryLeft}>
                    <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                    <Text style={styles.categoryName}>{item.categoryName}</Text>
                  </View>
                  <Text style={styles.categoryAmount}>
                    {formatCurrency(item.amount, settings.currency)}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.percentage}%`, backgroundColor: item.color }
                    ]}
                  />
                </View>

                <View style={styles.categoryFooter}>
                  <Text style={styles.categoryPercentage}>{item.percentage.toFixed(1)}% of total</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No spending data available</Text>
              <Text style={styles.emptySubtext}>Add transactions to see analytics</Text>
            </View>
          )}
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
    marginBottom: SPACING.lg,
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
  totalCard: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.accent,
    marginBottom: SPACING.xs,
  },
  transactionCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  transactionCountText: {
    fontSize: TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  chartSelector: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  chartTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: SPACING.sm,
  },
  chartTabActive: {
    backgroundColor: COLORS.accent,
  },
  chartTabText: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: TYPOGRAPHY.weightMedium,
  },
  chartTabTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  chartContainer: {
    marginBottom: SPACING.xl,
  },
  chart: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  chartTitle: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  chartSubtitle: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  chartStyle: {
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  noDataContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
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
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: RADIUS.xs,
    marginRight: SPACING.sm,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.text,
  },
  categoryAmount: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.accent,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.xs,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryPercentage: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
});
