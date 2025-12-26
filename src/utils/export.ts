import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../types';
import { formatDate } from './formatters';

// Export transactions to CSV
export const exportToCSV = async (transactions: Transaction[]): Promise<void> => {
  try {
    // Create CSV header
    const header = 'Date,Type,Category,Description,Amount\n';

    // Create CSV rows
    const rows = transactions
      .map((txn) => {
        const date = formatDate(txn.date, 'yyyy-MM-dd');
        const type = txn.type;
        const category = txn.category;
        const description = `"${txn.description.replace(/"/g, '""')}"`;
        const amount = txn.amount.toFixed(2);

        return `${date},${type},${category},${description},${amount}`;
      })
      .join('\n');

    const csv = header + rows;

    // Create file
    const fileName = `finance_tracker_${formatDate(new Date(), 'yyyy-MM-dd')}.csv`;
    const filePath = `${(FileSystem as any).documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csv);

    // Share file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export Transactions',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

// Export transactions to JSON
export const exportToJSON = async (transactions: Transaction[]): Promise<void> => {
  try {
    const data = JSON.stringify(transactions, null, 2);

    const fileName = `finance_tracker_${formatDate(new Date(), 'yyyy-MM-dd')}.json`;
    const filePath = `${(FileSystem as any).documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, data);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: 'Export Transactions',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw error;
  }
};

// Get file size in readable format
export const getReadableFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};
