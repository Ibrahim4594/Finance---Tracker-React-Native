import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../store/useStore';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { CURRENCIES } from '../constants/categories';
import { exportToCSV, exportToJSON } from '../utils/export';
import { scheduleNotification } from '../utils/notifications';
import { logout } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/Button';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, transactions } = useStore();
  const { user } = useAuth();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleCurrencyChange = () => {
    // Cycle through currencies
    const currentIndex = CURRENCIES.findIndex((c) => c.code === settings.currency);
    const nextIndex = (currentIndex + 1) % CURRENCIES.length;
    updateSettings({ currency: CURRENCIES[nextIndex].code });
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (transactions.length === 0) {
      Alert.alert('No Data', 'There are no transactions to export');
      return;
    }

    try {
      setExporting(true);
      if (format === 'csv') {
        await exportToCSV(transactions);
      } else {
        await exportToJSON(transactions);
      }
      setShowExportModal(false);
      Alert.alert('Success', `Exported ${transactions.length} transactions successfully!`);
    } catch (error) {
      Alert.alert('Export Failed', 'Failed to export transactions. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleTestNotification = async () => {
    await scheduleNotification(
      '🎉 Test Notification',
      'Finance Tracker notifications are working perfectly!',
      { test: true }
    );
    Alert.alert('Success', 'Test notification sent! Check your notification tray.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const totalTransactions = transactions.length;
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentCurrency = CURRENCIES.find((c) => c.code === settings.currency);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header */}
      <LinearGradient
        colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
        style={[styles.headerGradient, { paddingTop: insets.top + SPACING.md }]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>○</Text>
          </View>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsCards}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalTransactions}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {transactions.filter((t) => t.type === 'expense').length}
            </Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {transactions.filter((t) => t.type === 'income').length}
            </Text>
            <Text style={styles.statLabel}>Income</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>

          {/* Currency */}
          <TouchableOpacity style={styles.settingCard} onPress={handleCurrencyChange}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: `${COLORS.accent}15` }]}>
                <Text style={styles.settingIconText}>{currentCurrency?.symbol || '$'}</Text>
              </View>
              <View>
                <Text style={styles.settingLabel}>Currency</Text>
                <Text style={styles.settingValue}>
                  {currentCurrency?.name} ({currentCurrency?.symbol})
                </Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          {/* Dark Mode */}
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: `${COLORS.secondary}15` }]}>
                <Text style={[styles.settingIconText, { color: COLORS.secondary }]}>◐</Text>
              </View>
              <View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingValue}>
                  {settings.darkMode ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => updateSettings({ darkMode: value })}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.surface}
            />
          </View>

          {/* Notifications */}
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: `${COLORS.warning}15` }]}>
                <Text style={[styles.settingIconText, { color: COLORS.warning }]}>◎</Text>
              </View>
              <View>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingValue}>
                  {settings.notifications ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => updateSettings({ notifications: value })}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.surface}
            />
          </View>

          {/* Biometric */}
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: `${COLORS.success}15` }]}>
                <Text style={[styles.settingIconText, { color: COLORS.success }]}>◈</Text>
              </View>
              <View>
                <Text style={styles.settingLabel}>Biometric Lock</Text>
                <Text style={styles.settingValue}>
                  {settings.biometricEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.biometricEnabled}
              onValueChange={(value) => updateSettings({ biometricEnabled: value })}
              trackColor={{ false: COLORS.border, true: COLORS.accent }}
              thumbColor={COLORS.surface}
            />
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DATA & BACKUP</Text>

          <TouchableOpacity
            style={styles.settingCard}
            onPress={() => setShowExportModal(true)}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: `${COLORS.accent}15` }]}>
                <Text style={styles.settingIconText}>↗</Text>
              </View>
              <Text style={styles.settingLabel}>Export Data</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: `${COLORS.secondary}15` }]}>
                <Text style={[styles.settingIconText, { color: COLORS.secondary }]}>↻</Text>
              </View>
              <Text style={styles.settingLabel}>Backup & Restore</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: `${COLORS.textLight}15` }]}>
                <Text style={[styles.settingIconText, { color: COLORS.textSecondary }]}>i</Text>
              </View>
              <View>
                <Text style={styles.settingLabel}>App Version</Text>
                <Text style={styles.settingValue}>1.0.0</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconContainer, { backgroundColor: `${COLORS.accent}15` }]}>
                <Text style={styles.settingIconText}>✦</Text>
              </View>
              <Text style={styles.settingLabel}>Rate FinanceFlow</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Export Transactions</Text>
            <Text style={styles.modalSubtitle}>
              Choose format to export {transactions.length} transactions
            </Text>

            {exporting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.accent} />
                <Text style={styles.loadingText}>Exporting...</Text>
              </View>
            ) : (
              <View style={styles.modalButtons}>
                <Button
                  title="CSV Format"
                  onPress={() => handleExport('csv')}
                  size="large"
                  style={styles.exportButton}
                />
                <Button
                  title="JSON Format"
                  onPress={() => handleExport('json')}
                  variant="secondary"
                  size="large"
                  style={styles.exportButton}
                />
                <Button
                  title="Cancel"
                  onPress={() => setShowExportModal(false)}
                  variant="outline"
                  size="medium"
                  style={styles.cancelButton}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  headerTitle: {
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.h5,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.textInverse,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsCards: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.textInverse,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.caption,
    color: 'rgba(255, 255, 255, 0.6)',
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
  sectionTitle: {
    fontSize: TYPOGRAPHY.caption,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  settingCard: {
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingIconText: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.accent,
  },
  settingLabel: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightMedium,
    color: COLORS.text,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  settingArrow: {
    fontSize: 20,
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.weightLight,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutButtonText: {
    fontSize: TYPOGRAPHY.body,
    fontWeight: TYPOGRAPHY.weightSemiBold,
    color: COLORS.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 27, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    ...SHADOWS.elevated,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: TYPOGRAPHY.weightBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalButtons: {
    gap: SPACING.sm,
  },
  exportButton: {
    marginBottom: SPACING.xs,
  },
  cancelButton: {
    marginTop: SPACING.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});
