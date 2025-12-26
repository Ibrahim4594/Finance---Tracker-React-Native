import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../constants/theme';
import { SavingsGoal } from '../types';

interface Props {
  goal: SavingsGoal;
  currency: string;
  onPress?: () => void;
}

export default function SavingsGoalCard({ goal, currency, onPress }: Props) {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{goal.icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{goal.name}</Text>
          <Text style={styles.amount}>
            {currency}{goal.currentAmount.toFixed(0)} / {currency}{goal.targetAmount.toFixed(0)}
          </Text>
        </View>
        <Text style={styles.percentage}>{progress.toFixed(0)}%</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%`, backgroundColor: goal.color }]} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.remaining}>{currency}{remaining.toFixed(0)} to go</Text>
        {goal.deadline && (
          <Text style={styles.deadline}>
            Due: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.text,
    marginBottom: 2,
  },
  amount: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  percentage: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.accent,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: RADIUS.xs,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: RADIUS.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remaining: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weightMedium,
  },
  deadline: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.accent,
  },
});
