import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import { useStore } from '../store/useStore';
import { RecurringTransaction, RecurringFrequency, TransactionType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface RecurringFormData {
  amount: string;
  type: TransactionType;
  categoryId: string;
  description: string;
  frequency: RecurringFrequency;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

const FREQUENCY_OPTIONS: { value: RecurringFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

/**
 * Screen for managing recurring transactions (subscriptions, bills, salaries)
 * Allows users to create, edit, enable/disable, and delete recurring transactions
 */
export const RecurringTransactionsScreen: React.FC = () => {
  const {
    recurringTransactions,
    categories,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    settings,
  } = useStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RecurringFormData>({
    amount: '',
    type: 'expense',
    categoryId: '',
    description: '',
    frequency: 'monthly',
    startDate: new Date(),
    isActive: true,
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      amount: '',
      type: 'expense',
      categoryId: '',
      description: '',
      frequency: 'monthly',
      startDate: new Date(),
      isActive: true,
    });
    setIsModalVisible(true);
  };

  const openEditModal = (recurring: RecurringTransaction) => {
    setEditingId(recurring.id);
    setFormData({
      amount: recurring.amount.toString(),
      type: recurring.type,
      categoryId: recurring.categoryId,
      description: recurring.description,
      frequency: recurring.frequency,
      startDate: recurring.startDate,
      endDate: recurring.endDate,
      isActive: recurring.isActive,
    });
    setIsModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.amount || !formData.categoryId || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const category = categories.find((cat) => cat.id === formData.categoryId);
    if (!category) {
      Alert.alert('Error', 'Invalid category selected');
      return;
    }

    if (editingId) {
      updateRecurringTransaction(editingId, {
        amount,
        type: formData.type,
        category: category.name,
        categoryId: formData.categoryId,
        description: formData.description,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      });
    } else {
      addRecurringTransaction({
        amount,
        type: formData.type,
        category: category.name,
        categoryId: formData.categoryId,
        description: formData.description,
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      });
    }

    setIsModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Recurring Transaction',
      'Are you sure you want to delete this recurring transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRecurringTransaction(id),
        },
      ]
    );
  };

  const toggleActive = (recurring: RecurringTransaction) => {
    updateRecurringTransaction(recurring.id, {
      isActive: !recurring.isActive,
    });
  };

  const getNextOccurrence = (recurring: RecurringTransaction): Date => {
    const base = recurring.lastProcessed || recurring.startDate;
    const next = new Date(base);

    switch (recurring.frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  };

  const filteredCategories = categories.filter((cat) => cat.type === formData.type);

  const renderRecurringItem = ({ item }: { item: RecurringTransaction }) => {
    const nextDate = getNextOccurrence(item);
    const isPastDue = nextDate < new Date();

    return (
      <View style={styles.recurringItem}>
        <View style={styles.recurringHeader}>
          <View style={styles.recurringInfo}>
            <View style={styles.recurringTitleRow}>
              <Text style={styles.recurringDescription}>{item.description}</Text>
              <Text
                style={[
                  styles.recurringAmount,
                  { color: item.type === 'income' ? COLORS.success : COLORS.error },
                ]}
              >
                {item.type === 'income' ? '+' : '-'}
                {formatCurrency(item.amount, settings.currency)}
              </Text>
            </View>
            <Text style={styles.recurringCategory}>{item.category}</Text>
            <View style={styles.recurringMeta}>
              <Text style={styles.recurringFrequency}>
                {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
              </Text>
              <Text style={styles.recurringDot}> • </Text>
              <Text style={[styles.recurringNext, isPastDue && styles.pastDue]}>
                Next: {formatDate(nextDate, 'MMM dd, yyyy')}
              </Text>
            </View>
          </View>
          <View style={styles.recurringActions}>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleActive(item)}
              trackColor={{ false: COLORS.border, true: `${COLORS.accent}50` }}
              thumbColor={item.isActive ? COLORS.accent : COLORS.textSecondary}
            />
          </View>
        </View>
        <View style={styles.recurringButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDelete(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Recurring Transactions</Text>
        <Text style={styles.subtitle}>Manage your subscriptions and recurring bills</Text>
      </View>

      {recurringTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔄</Text>
          <Text style={styles.emptyTitle}>No Recurring Transactions</Text>
          <Text style={styles.emptyMessage}>
            Add recurring transactions to automatically track subscriptions, bills, and regular
            income.
          </Text>
        </View>
      ) : (
        <FlatList
          data={recurringTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderRecurringItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={openAddModal} activeOpacity={0.8}>
        <Text style={styles.addButtonText}>+ Add Recurring Transaction</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeToggle}>
                <TouchableOpacity
                  style={[styles.typeButton, formData.type === 'expense' && styles.typeButtonActive]}
                  onPress={() => setFormData({ ...formData, type: 'expense', categoryId: '' })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === 'expense' && styles.typeButtonTextActive,
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, formData.type === 'income' && styles.typeButtonActive]}
                  onPress={() => setFormData({ ...formData, type: 'income', categoryId: '' })}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.type === 'income' && styles.typeButtonTextActive,
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Amount ({settings.currency})</Text>
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="e.g., Netflix Subscription"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {filteredCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      formData.categoryId === category.id && styles.categoryOptionActive,
                      { borderColor: category.color },
                    ]}
                    onPress={() => setFormData({ ...formData, categoryId: category.id })}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyGrid}>
                {FREQUENCY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.frequencyOption,
                      formData.frequency === option.value && styles.frequencyOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, frequency: option.value })}
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        formData.frequency === option.value && styles.frequencyTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.activeToggle}>
                <Text style={styles.label}>Active</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                  trackColor={{ false: COLORS.border, true: `${COLORS.accent}50` }}
                  thumbColor={formData.isActive ? COLORS.accent : COLORS.textSecondary}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: TYPOGRAPHY.h3,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  listContent: {
    padding: SPACING.md,
  },
  recurringItem: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  recurringInfo: {
    flex: 1,
  },
  recurringTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  recurringDescription: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  recurringAmount: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  recurringCategory: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  recurringMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringFrequency: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  recurringDot: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  recurringNext: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  pastDue: {
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  recurringActions: {
    justifyContent: 'center',
  },
  recurringButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editButton: {
    flex: 1,
    backgroundColor: `${COLORS.accent}20`,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.accent,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: `${COLORS.error}15`,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.error,
  },
  addButton: {
    backgroundColor: COLORS.accent,
    margin: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  modalForm: {
    padding: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.text,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  typeButtonText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  typeButtonTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  categoryScroll: {
    marginTop: SPACING.sm,
  },
  categoryOption: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    alignItems: 'center',
    marginRight: SPACING.sm,
    minWidth: 80,
  },
  categoryOptionActive: {
    backgroundColor: `${COLORS.accent}10`,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  categoryName: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.text,
    textAlign: 'center',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  frequencyOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  frequencyOptionActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  frequencyText: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  frequencyTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  activeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.primary,
  },
});

export default RecurringTransactionsScreen;
