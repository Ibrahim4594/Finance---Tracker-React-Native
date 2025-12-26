import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  blur?: boolean;
  padding?: number;
}

export default function Card({
  children,
  style,
  gradient = false,
  blur = false,
  padding = SPACING.md,
}: CardProps) {
  if (gradient) {
    return (
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { padding }, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (blur) {
    return (
      <BlurView intensity={20} tint="light" style={[styles.card, { padding }, style]}>
        {children}
      </BlurView>
    );
  }

  return <View style={[styles.card, { padding }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
});
