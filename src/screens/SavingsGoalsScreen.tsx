import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../constants/theme';
import { useStore } from '../store/useStore';
import { SavingsGoal } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface GoalFormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline?: Date;
  icon: string;
  color: string;
}

const GOAL_ICONS = ['💰', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🏖️', '🎉', '🎯', '⭐'];
const GOAL_COLORS = [
  '#4ECDC4',
  '#FF6B6B',
  '#95E1D3',
  '#F38181',
  '#AA96DA',
  '#FCBAD3',
  '#FEC8D8',
  '#957DAD',
];

/**
 * Screen for managing savings goals with progress tracking
 * Allows users to create, track, contribute to, and achieve their financial goals
 */
export const SavingsGoalsScreen: React.FC = () => {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, settings } =
    useStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isContributeModalVisible, setIsContributeModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    icon: '💰',
    color: '#4ECDC4',
  });

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '0',
      icon: '💰',
      color: '#4ECDC4',
    });
    setIsModalVisible(true);
  };

  const openEditModal = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      icon: goal.icon,
      color: goal.color,
    });
    setIsModalVisible(true);
  };

  const openContributeModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setContributionAmount('');
    setIsContributeModalVisible(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.targetAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    const currentAmount = parseFloat(formData.currentAmount);

    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid target amount');
      return;
    }

    if (isNaN(currentAmount) || currentAmount < 0) {
      Alert.alert('Error', 'Please enter a valid current amount');
      return;
    }

    if (currentAmount > targetAmount) {
      Alert.alert('Error', 'Current amount cannot exceed target amount');
      return;
    }

    if (editingId) {
      updateSavingsGoal(editingId, {
        name: formData.name,
        targetAmount,
        currentAmount,
        deadline: formData.deadline,
        icon: formData.icon,
        color: formData.color,
      });
    } else {
      addSavingsGoal({
        name: formData.name,
        targetAmount,
        currentAmount,
        deadline: formData.deadline,
        icon: formData.icon,
        color: formData.color,
      });
    }

    setIsModalVisible(false);
  };

  const handleContribute = () => {
    if (!selectedGoal) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid contribution amount');
      return;
    }

    const newAmount = selectedGoal.currentAmount + amount;
    if (newAmount > selectedGoal.targetAmount) {
      Alert.alert(
        'Exceeds Target',
        'This contribution would exceed your goal. Would you like to mark it as complete?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete Goal',
            onPress: () => {
              updateSavingsGoal(selectedGoal.id, {
                currentAmount: selectedGoal.targetAmount,
              });
              setIsContributeModalVisible(false);
              Alert.alert('Congratulations!', `You've reached your goal: ${selectedGoal.name}! 🎉`);
            },
          },
        ]
      );
      return;
    }

    updateSavingsGoal(selectedGoal.id, {
      currentAmount: newAmount,
    });

    setIsContributeModalVisible(false);

    // Check if goal is now complete
    if (newAmount === selectedGoal.targetAmount) {
      Alert.alert('Congratulations!', `You've reached your goal: ${selectedGoal.name}! 🎉`);
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Savings Goal', `Are you sure you want to delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSavingsGoal(id),
      },
    ]);
  };

  const getProgressPercentage = (goal: SavingsGoal): number => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const getRemainingAmount = (goal: SavingsGoal): number => {
    return goal.targetAmount - goal.currentAmount;
  };

  const getDaysRemaining = (deadline?: Date): number | null => {
    if (!deadline) return null;
    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const renderGoalItem = ({ item }: { item: SavingsGoal }) => {
    const progress = getProgressPercentage(item);
    const remaining = getRemainingAmount(item);
    const daysLeft = getDaysRemaining(item.deadline);
    const isComplete = progress >= 100;

    return (
      <View style={[styles.goalCard, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
        <View style={styles.goalHeader}>
          <View style={styles.goalTitleRow}>
            <Text style={styles.goalIcon}>{item.icon}</Text>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{item.name}</Text>
              <Text style={styles.goalTarget}>
                {formatCurrency(item.currentAmount, settings.currency)} of{' '}
                {formatCurrency(item.targetAmount, settings.currency)}
              </Text>
            </View>
            {isComplete && <Text style={styles.completeBadge}>✓ Complete</Text>}
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: isComplete ? COLORS.success : item.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.goalMeta}>
          {!isComplete && (
            <Text style={styles.goalRemaining}>
              {formatCurrency(remaining, settings.currency)} remaining
            </Text>
          )}
          {daysLeft !== null && daysLeft > 0 && (
            <Text style={[styles.goalDeadline, daysLeft < 30 && styles.deadlineUrgent]}>
              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </Text>
          )}
          {daysLeft !== null && daysLeft <= 0 && (
            <Text style={styles.deadlineOverdue}>Deadline passed</Text>
          )}
        </View>

        <View style={styles.goalActions}>
          {!isComplete && (
            <TouchableOpacity
              style={[styles.contributeButton, { backgroundColor: `${item.color}20` }]}
              onPress={() => openContributeModal(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.contributeButtonText, { color: item.color }]}>+ Contribute</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteIconButton}
            onPress={() => handleDelete(item.id, item.name)}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Savings Goals</Text>
        <Text style={styles.subtitle}>Track your progress toward financial dreams</Text>
      </View>

      {savingsGoals.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Overall Progress</Text>
          <Text style={styles.summaryAmount}>
            {formatCurrency(totalSaved, settings.currency)} /{' '}
            {formatCurrency(totalTarget, settings.currency)}
          </Text>
          <View style={styles.summaryProgressBar}>
            <View
              style={[
                styles.summaryProgressFill,
                { width: `${Math.min(overallProgress, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.summaryPercentage}>{Math.round(overallProgress)}% complete</Text>
        </View>
      )}

      {savingsGoals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎯</Text>
          <Text style={styles.emptyTitle}>No Savings Goals Yet</Text>
          <Text style={styles.emptyMessage}>
            Create savings goals to track your progress toward vacations, purchases, emergencies,
            and more!
          </Text>
        </View>
      ) : (
        <FlatList
          data={savingsGoals}
          keyExtractor={(item) => item.id}
          renderItem={renderGoalItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={openAddModal} activeOpacity={0.8}>
        <Text style={styles.addButtonText}>+ Create Savings Goal</Text>
      </TouchableOpacity>

      {/* Add/Edit Goal Modal */}
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
                {editingId ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Goal Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Vacation to Hawaii"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Target Amount ({settings.currency})</Text>
              <TextInput
                style={styles.input}
                value={formData.targetAmount}
                onChangeText={(text) => setFormData({ ...formData, targetAmount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Current Amount ({settings.currency})</Text>
              <TextInput
                style={styles.input}
                value={formData.currentAmount}
                onChangeText={(text) => setFormData({ ...formData, currentAmount: text })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.label}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
                {GOAL_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      formData.icon === icon && styles.iconOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, icon })}
                  >
                    <Text style={styles.iconText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Color</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorScroll}>
                {GOAL_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      formData.color === color && styles.colorOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, color })}
                  />
                ))}
              </ScrollView>

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

      {/* Contribute Modal */}
      <Modal
        visible={isContributeModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsContributeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.contributeModalContent}>
            <Text style={styles.contributeModalTitle}>
              Contribute to {selectedGoal?.name}
            </Text>
            <Text style={styles.contributeModalSubtitle}>
              Current: {formatCurrency(selectedGoal?.currentAmount || 0, settings.currency)} /{' '}
              {formatCurrency(selectedGoal?.targetAmount || 0, settings.currency)}
            </Text>

            <Text style={styles.label}>Contribution Amount ({settings.currency})</Text>
            <TextInput
              style={styles.input}
              value={contributionAmount}
              onChangeText={setContributionAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.textSecondary}
              autoFocus
            />

            <View style={styles.contributeButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsContributeModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleContribute}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Add Contribution</Text>
              </TouchableOpacity>
            </View>
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
  summaryCard: {
    backgroundColor: COLORS.accent,
    margin: SPACING.md,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  summaryAmount: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  summaryProgressBar: {
    height: 8,
    backgroundColor: `${COLORS.primary}30`,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  summaryProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },
  summaryPercentage: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.primary,
    textAlign: 'right',
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
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalHeader: {
    marginBottom: SPACING.md,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  goalIcon: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  goalTarget: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  completeBadge: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.success,
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  progressText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
    minWidth: 45,
    textAlign: 'right',
  },
  goalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  goalRemaining: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  goalDeadline: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  deadlineUrgent: {
    color: COLORS.warning,
  },
  deadlineOverdue: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weightSemiBold,
  },
  goalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  contributeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  contributeButtonText: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.weightBold,
  },
  editIconButton: {
    width: 40,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    backgroundColor: `${COLORS.accent}20`,
  },
  editIcon: {
    fontSize: 16,
  },
  deleteIconButton: {
    width: 40,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    backgroundColor: `${COLORS.error}15`,
  },
  deleteIcon: {
    fontSize: 16,
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
  iconScroll: {
    marginTop: SPACING.sm,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  iconOptionActive: {
    borderColor: COLORS.accent,
    backgroundColor: `${COLORS.accent}20`,
  },
  iconText: {
    fontSize: 24,
  },
  colorScroll: {
    marginTop: SPACING.sm,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: COLORS.text,
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
  contributeModalContent: {
    backgroundColor: COLORS.background,
    margin: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  contributeModalTitle: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  contributeModalSubtitle: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  contributeButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
});

export default SavingsGoalsScreen;
