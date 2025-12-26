import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={[styles.content, { paddingTop: insets.top + SPACING.xl }]}>
          {/* Logo & Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoInner}>
                <Text style={styles.logoSymbol}>₹</Text>
              </View>
            </View>
            <Text style={styles.brandName}>FinanceFlow</Text>
            <Text style={styles.tagline}>Master Your Money</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <FeatureCard
              icon="◎"
              title="Smart Tracking"
              description="Effortlessly monitor income & expenses"
            />
            <FeatureCard
              icon="◈"
              title="Budget Goals"
              description="Set limits and achieve financial targets"
            />
            <FeatureCard
              icon="◐"
              title="Deep Insights"
              description="Visualize spending patterns instantly"
            />
          </View>

          {/* CTA Buttons */}
          <View style={[styles.ctaSection, { paddingBottom: insets.bottom + SPACING.lg }]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our Terms of Service
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <View style={styles.featureCard}>
    <View style={styles.featureIconContainer}>
      <Text style={styles.featureIcon}>{icon}</Text>
    </View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'space-between',
  },
  brandSection: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoInner: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSymbol: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.primary,
  },
  brandName: {
    fontSize: TYPOGRAPHY.h1,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textInverse,
    letterSpacing: -1,
    marginBottom: SPACING.xs,
  },
  tagline: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  featuresSection: {
    gap: SPACING.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureIcon: {
    fontSize: 20,
    color: COLORS.accent,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.h6,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.textInverse,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  ctaSection: {
    gap: SPACING.md,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.textInverse,
  },
  termsText: {
    fontSize: TYPOGRAPHY.small,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
