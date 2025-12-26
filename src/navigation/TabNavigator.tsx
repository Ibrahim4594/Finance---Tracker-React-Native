import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, LAYOUT, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../constants/theme';
import { TabParamList } from '../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Premium tab icons using geometric symbols
const getTabIcon = (routeName: string) => {
  const icons: { [key: string]: string } = {
    Dashboard: '◎',
    Transactions: '↗',
    Budget: '◈',
    Analytics: '◐',
    Profile: '○',
  };
  return icons[routeName] || '•';
};

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { paddingBottom: insets.bottom > 0 ? insets.bottom : SPACING.sm }
        ],
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => (
          <View style={styles.iconContainer}>
            <View style={[
              styles.iconWrapper,
              focused && styles.iconWrapperActive
            ]}>
              <Text style={[
                styles.iconText,
                focused && styles.iconTextActive
              ]}>
                {getTabIcon(route.name)}
              </Text>
            </View>
          </View>
        ),
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{ tabBarLabel: 'Activity' }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ tabBarLabel: 'Budget' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Insights' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    height: LAYOUT.tabBarHeight + 10,
    paddingTop: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabBarLabel: {
    fontSize: TYPOGRAPHY.micro,
    fontWeight: TYPOGRAPHY.weightMedium,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: `${COLORS.accent}15`,
  },
  iconText: {
    fontSize: 20,
    color: COLORS.textLight,
  },
  iconTextActive: {
    color: COLORS.accent,
  },
});
