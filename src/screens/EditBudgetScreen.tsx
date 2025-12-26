import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CategoryBudget } from '../types';
import { useStore } from '../store/useStore';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, LAYOUT } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatCurrency, getCurrentMonthKey } from '../utils/formatters';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function EditBudgetScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { categories, budgets, setBudget } = useStore();
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);
  const [totalBudget, setTotalBudget] = useState('0');

  const currentMonth = getCurrentMonthKey();
  const currentBudget = budgets.find((b) => b.month === currentMonth);

  useEffect(() => {
    if (currentBudget) {
      setCategoryBudgets(currentBudget.categoryBudgets);
      setTotalBudget(currentBudget.totalBudget.toString());
    } else {
      // Initialize with expense categories
      const expenseCategories = categories.filter((cat) => cat.type === 'expense');
      const initialBudgets: CategoryBudget[] = expenseCategories.map((cat) => ({
        categoryId: cat.id,
        limit: cat.budgetLimit || 0,
        spent: 0,
      }));
      setCategoryBudgets(initialBudgets);
    }
  }, [currentBudget, categories]);

  const updateCategoryBudget = (categoryId: string, limitStr: string) => {
    const limit = parseFloat(limitStr) || 0;
    setCategoryBudgets((prev) =>
      prev.map((cb) => (cb.categoryId === categoryId ? { ...cb, limit } : cb))
    );
  };

  const handleSave = () => {
    const total = parseFloat(totalBudget) || 0;
    const categoryTotal = categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0);

    if (categoryTotal > total) {
      Alert.alert(
        'Budget Exceeded',
        `Category budgets (${formatCurrency(categoryTotal)}) exceed total budget (${formatCurrency(total)})`
      );
      return;
    }

    setBudget({
      id: currentBudget?.id || `budget_${Date.now()}`,
      month: currentMonth,
      totalBudget: total,
      categoryBudgets,
    });

    Alert.alert('Success', 'Budget saved successfully!');
    navigation.goBack();
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)?.icon || '●';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Budget</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total Monthly Budget</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.input}
              value={totalBudget}
              onChangeText={setTotalBudget}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={COLORS.textLight}
            />
          </View>
        </View>

        {/* Category Budgets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Budgets</Text>
          {categoryBudgets.map((categoryBudget) => (
            <View key={categoryBudget.categoryId} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryIcon}>{getCategoryIcon(categoryBudget.categoryId)}</Text>
                <Text style={styles.categoryName}>{getCategoryName(categoryBudget.categoryId)}</Text>
              </View>
              <View style={styles.categoryInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.categoryInput}
                  value={categoryBudget.limit.toString()}
                  onChangeText={(value) => updateCategoryBudget(categoryBudget.categoryId, value)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Allocated:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0))}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Remaining:</Text>
            <Text style={[styles.summaryValue, styles.remainingValue]}>
              {formatCurrency(
                parseFloat(totalBudget || '0') -
                  categoryBudgets.reduce((sum, cb) => sum + cb.limit, 0)
              )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: COLORS.text,
    marginTop: -4,
  },
  title: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
  },
  saveButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.accent,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.xl,
  },
  section: {
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: LAYOUT.inputHeight,
    ...SHADOWS.small,
  },
  currencySymbol: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.accent,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.text,
  },
  categoryInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundDark,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    minWidth: 100,
  },
  categoryInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
    textAlign: 'right',
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.accent,
    gap: SPACING.md,
    ...SHADOWS.medium,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
  },
  remainingValue: {
    color: COLORS.accent,
  },
});
