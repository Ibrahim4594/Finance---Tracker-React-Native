import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TransactionType } from '../types';
import { useStore } from '../store/useStore';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { CURRENCIES } from '../constants/categories';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AddTransactionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { addTransaction, categories, settings } = useStore();
  const currentCurrency = CURRENCIES.find((c) => c.code === settings.currency);

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const filteredCategories = categories.filter((cat) => cat.type === type);

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Category Required', 'Please select a category');
      return;
    }

    const category = categories.find((cat) => cat.id === selectedCategoryId);
    if (!category) {
      Alert.alert('Error', 'Selected category not found');
      return;
    }

    addTransaction({
      amount: parseFloat(amount),
      type,
      category: category.name,
      categoryId: selectedCategoryId,
      description: description || category.name,
      date: new Date(),
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMiddle]}
        style={[styles.header, { paddingTop: insets.top + SPACING.md }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Transaction</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Amount Display */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>
            {type === 'expense' ? 'You spent' : 'You received'}
          </Text>
          <View style={styles.amountDisplay}>
            <Text style={styles.currencySymbol}>{currentCurrency?.symbol || '$'}</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + SPACING.xxl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction Type Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>TRANSACTION TYPE</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'expense' && styles.expenseButtonActive
                ]}
                onPress={() => {
                  setType('expense');
                  setSelectedCategoryId('');
                }}
              >
                <View style={[
                  styles.typeIconContainer,
                  type === 'expense' && styles.expenseIconActive
                ]}>
                  <Text style={styles.typeIcon}>↑</Text>
                </View>
                <Text style={[
                  styles.typeButtonText,
                  type === 'expense' && styles.typeButtonTextActive,
                ]}>
                  Expense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  type === 'income' && styles.incomeButtonActive
                ]}
                onPress={() => {
                  setType('income');
                  setSelectedCategoryId('');
                }}
              >
                <View style={[
                  styles.typeIconContainer,
                  type === 'income' && styles.incomeIconActive
                ]}>
                  <Text style={styles.typeIcon}>↓</Text>
                </View>
                <Text style={[
                  styles.typeButtonText,
                  type === 'income' && styles.typeButtonTextActive,
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Selector */}
          <View style={styles.section}>
            <Text style={styles.label}>SELECT CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {filteredCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategoryId === category.id && styles.categoryItemActive,
                  ]}
                  onPress={() => setSelectedCategoryId(category.id)}
                >
                  <View
                    style={[
                      styles.categoryIconContainer,
                      {
                        backgroundColor:
                          selectedCategoryId === category.id
                            ? COLORS.accent
                            : COLORS.backgroundDark,
                      },
                    ]}
                  >
                    <Text style={[
                      styles.categoryIcon,
                      { color: selectedCategoryId === category.id ? COLORS.primary : COLORS.textSecondary }
                    ]}>
                      {category.icon}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      selectedCategoryId === category.id && styles.categoryNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.label}>NOTE (OPTIONAL)</Text>
            <View style={[
              styles.descriptionContainer,
              focusedInput === 'description' && styles.inputFocused
            ]}>
              <TextInput
                style={styles.descriptionInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Add a note..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={3}
                onFocus={() => setFocusedInput('description')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.9}
          >
            <Text style={styles.saveButtonText}>Save Transaction</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.textInverse,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.textInverse,
  },
  headerSpacer: {
    width: 40,
  },
  amountSection: {
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 36,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.accent,
    marginRight: SPACING.xs,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textInverse,
    minWidth: 100,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.small,
  },
  expenseButtonActive: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  incomeButtonActive: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  typeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseIconActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  incomeIconActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  typeIcon: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textSecondary,
  },
  typeButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.textSecondary,
  },
  typeButtonTextActive: {
    color: COLORS.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryItem: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  categoryItemActive: {
    borderColor: COLORS.accent,
    ...SHADOWS.medium,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weightMedium,
  },
  categoryNameActive: {
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  descriptionContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  inputFocused: {
    borderColor: COLORS.accent,
    ...SHADOWS.medium,
  },
  descriptionInput: {
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.medium,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
});
