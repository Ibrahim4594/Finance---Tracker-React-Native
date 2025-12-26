import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior for local notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Setup local notifications (works in Expo Go)
export async function setupLocalNotifications() {
  try {
    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C9A227',
      });
    }

    // Request permissions for local notifications
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.log('Local notifications setup error:', error);
    return false;
  }
}

// Schedule a local notification
export async function scheduleNotification(
  title: string,
  body: string,
  data?: any,
  delaySeconds: number = 0
) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds, repeats: false } as any : null,
    });
    return id;
  } catch (error) {
    console.log('Error scheduling notification:', error);
    return null;
  }
}

// Cancel a scheduled notification
export async function cancelNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log('Error canceling notification:', error);
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error canceling all notifications:', error);
  }
}

// Get all scheduled notifications
export async function getAllScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.log('Error getting scheduled notifications:', error);
    return [];
  }
}

// Budget Alert Notifications
export async function sendBudgetAlert(categoryName: string, percentage: number, spent: number, limit: number, currency: string) {
  const title = `Budget Alert: ${categoryName}`;
  let body = '';
  let emoji = '';

  if (percentage >= 100) {
    emoji = '!';
    body = `You've exceeded your budget! Spent ${currency}${spent.toFixed(2)} of ${currency}${limit.toFixed(2)}`;
  } else if (percentage >= 90) {
    emoji = '!';
    body = `You're at ${Math.round(percentage)}% of your budget (${currency}${spent.toFixed(2)} of ${currency}${limit.toFixed(2)})`;
  } else if (percentage >= 75) {
    emoji = '*';
    body = `You've used ${Math.round(percentage)}% of your budget for this category`;
  }

  await scheduleNotification(
    `${emoji} ${title}`,
    body,
    { category: categoryName, type: 'budget_alert' }
  );
}

// Daily Summary Notification
export async function scheduleDailySummary(totalSpent: number, currency: string, transactionCount: number) {
  const title = 'Daily Summary';
  const body = `You spent ${currency}${totalSpent.toFixed(2)} today across ${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}`;

  await scheduleNotification(
    title,
    body,
    { type: 'daily_summary' }
  );
}

// Recurring Transaction Reminder
export async function scheduleRecurringReminder(transactionName: string, amount: number, currency: string, daysUntil: number) {
  const title = 'Upcoming Payment';
  const body = `${transactionName} of ${currency}${amount.toFixed(2)} is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;

  await scheduleNotification(
    title,
    body,
    { type: 'recurring_reminder' },
    daysUntil * 24 * 60 * 60 // Convert days to seconds
  );
}

// Savings Goal Achievement
export async function sendSavingsGoalNotification(amount: number, currency: string) {
  const title = 'Savings Milestone!';
  const body = `Congratulations! You've saved ${currency}${amount.toFixed(2)} this month!`;

  await scheduleNotification(
    title,
    body,
    { type: 'savings_goal' }
  );
}

// Overspending Warning
export async function sendOverspendingWarning(averageDaily: number, todaySpent: number, currency: string) {
  if (todaySpent > averageDaily * 1.5) {
    const title = 'Overspending Alert';
    const body = `You've spent ${currency}${todaySpent.toFixed(2)} today, which is ${Math.round((todaySpent / averageDaily - 1) * 100)}% more than your daily average`;

    await scheduleNotification(
      title,
      body,
      { type: 'overspending_warning' }
    );
  }
}
