import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction, Category, Budget, SavingsGoal, UserSettings } from '../types';
import { formatCurrency, formatDate } from './formatters';

export type ExportFormat = 'csv' | 'json' | 'html';

export interface ExportOptions {
  format: ExportFormat;
  dateRange?: {
    start: Date;
    end: Date;
  };
  categoryIds?: string[];
  transactionType?: 'income' | 'expense' | 'all';
  includeMetadata?: boolean;
  includeCategories?: boolean;
  includeBudgets?: boolean;
  includeSavingsGoals?: boolean;
}

export interface ExportResult {
  filePath: string;
  fileName: string;
  size: number;
  format: ExportFormat;
}

/**
 * Filters transactions based on export options
 */
const filterTransactions = (
  transactions: Transaction[],
  options: ExportOptions
): Transaction[] => {
  let filtered = [...transactions];

  // Filter by date range
  if (options.dateRange) {
    const { start, end } = options.dateRange;
    filtered = filtered.filter((t) => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  }

  // Filter by category
  if (options.categoryIds && options.categoryIds.length > 0) {
    filtered = filtered.filter((t) => options.categoryIds!.includes(t.categoryId));
  }

  // Filter by transaction type
  if (options.transactionType && options.transactionType !== 'all') {
    filtered = filtered.filter((t) => t.type === options.transactionType);
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return filtered;
};

/**
 * Converts transactions to CSV format
 */
const transactionsToCSV = (
  transactions: Transaction[],
  categories: Category[],
  settings: UserSettings
): string => {
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    'Amount',
    'Currency',
    'Receipt',
    'Created At',
    'Updated At',
  ];

  const rows = transactions.map((t) => {
    const category = categories.find((c) => c.id === t.categoryId);
    return [
      formatDate(t.date, 'yyyy-MM-dd'),
      t.type,
      category?.name || 'Unknown',
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
      t.amount.toString(),
      settings.currency,
      t.receiptImage ? 'Yes' : 'No',
      formatDate(t.createdAt, 'yyyy-MM-dd HH:mm:ss'),
      formatDate(t.updatedAt, 'yyyy-MM-dd HH:mm:ss'),
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  return csvContent;
};

/**
 * Converts data to JSON format with optional metadata
 */
const dataToJSON = (
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  settings: UserSettings,
  options: ExportOptions
): string => {
  const data: any = {
    transactions,
  };

  if (options.includeCategories) {
    data.categories = categories;
  }

  if (options.includeBudgets) {
    data.budgets = budgets;
  }

  if (options.includeSavingsGoals) {
    data.savingsGoals = savingsGoals;
  }

  if (options.includeMetadata) {
    data.metadata = {
      exportDate: new Date().toISOString(),
      transactionCount: transactions.length,
      dateRange: options.dateRange
        ? {
            start: options.dateRange.start.toISOString(),
            end: options.dateRange.end.toISOString(),
          }
        : null,
      settings: {
        currency: settings.currency,
        language: settings.language,
      },
      version: '1.0.0',
    };
  }

  return JSON.stringify(data, null, 2);
};

/**
 * Converts transactions to HTML format with styling
 */
const transactionsToHTML = (
  transactions: Transaction[],
  categories: Category[],
  settings: UserSettings,
  options: ExportOptions
): string => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const dateRangeText = options.dateRange
    ? `${formatDate(options.dateRange.start, 'MMM dd, yyyy')} - ${formatDate(options.dateRange.end, 'MMM dd, yyyy')}`
    : 'All Time';

  const rows = transactions
    .map((t) => {
      const category = categories.find((c) => c.id === t.categoryId);
      const amountColor = t.type === 'income' ? '#10B981' : '#EF4444';
      return `
      <tr>
        <td>${formatDate(t.date, 'MMM dd, yyyy')}</td>
        <td><span class="badge ${t.type}">${t.type}</span></td>
        <td>${category?.icon || ''} ${category?.name || 'Unknown'}</td>
        <td>${t.description}</td>
        <td style="color: ${amountColor}; font-weight: 600;">
          ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount, settings.currency)}
        </td>
      </tr>
    `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial Report - ${dateRangeText}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #F9FAFB;
      padding: 40px 20px;
      color: #1F2937;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 32px; margin-bottom: 8px; }
    .header p { opacity: 0.9; font-size: 16px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px 40px;
      background: #F9FAFB;
      border-bottom: 1px solid #E5E7EB;
    }
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .summary-card.income { border-left-color: #10B981; }
    .summary-card.expense { border-left-color: #EF4444; }
    .summary-card.balance { border-left-color: #667EEA; }
    .summary-card h3 {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card p {
      font-size: 28px;
      font-weight: 700;
    }
    .summary-card.income p { color: #10B981; }
    .summary-card.expense p { color: #EF4444; }
    .summary-card.balance p { color: #667EEA; }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead {
      background: #F9FAFB;
      border-top: 1px solid #E5E7EB;
      border-bottom: 1px solid #E5E7EB;
    }
    th {
      text-align: left;
      padding: 16px 24px;
      font-size: 12px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 16px 24px;
      border-bottom: 1px solid #F3F4F6;
    }
    tbody tr:hover {
      background: #F9FAFB;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .badge.income {
      background: #D1FAE5;
      color: #065F46;
    }
    .badge.expense {
      background: #FEE2E2;
      color: #991B1B;
    }
    .footer {
      padding: 24px 40px;
      text-align: center;
      color: #9CA3AF;
      font-size: 14px;
      background: #F9FAFB;
      border-top: 1px solid #E5E7EB;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Financial Report</h1>
      <p>${dateRangeText}</p>
    </div>

    <div class="summary">
      <div class="summary-card income">
        <h3>Total Income</h3>
        <p>${formatCurrency(totalIncome, settings.currency)}</p>
      </div>
      <div class="summary-card expense">
        <h3>Total Expenses</h3>
        <p>${formatCurrency(totalExpenses, settings.currency)}</p>
      </div>
      <div class="summary-card balance">
        <h3>Net Balance</h3>
        <p>${formatCurrency(balance, settings.currency)}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Category</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #9CA3AF;">No transactions found</td></tr>'}
      </tbody>
    </table>

    <div class="footer">
      <p>Generated on ${formatDate(new Date(), 'MMMM dd, yyyy')} • Total: ${transactions.length} transactions</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Exports financial data based on specified options
 */
export const exportData = async (
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  settings: UserSettings,
  options: ExportOptions
): Promise<ExportResult | null> => {
  try {
    // Filter transactions
    const filteredTransactions = filterTransactions(transactions, options);

    if (filteredTransactions.length === 0) {
      throw new Error('No transactions found matching the selected criteria');
    }

    // Generate content based on format
    let content: string;
    let fileExtension: string;

    switch (options.format) {
      case 'csv':
        content = transactionsToCSV(filteredTransactions, categories, settings);
        fileExtension = 'csv';
        break;
      case 'json':
        content = dataToJSON(
          filteredTransactions,
          categories,
          budgets,
          savingsGoals,
          settings,
          options
        );
        fileExtension = 'json';
        break;
      case 'html':
        content = transactionsToHTML(filteredTransactions, categories, settings, options);
        fileExtension = 'html';
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }

    // Create file name
    const timestamp = new Date().getTime();
    const dateRange = options.dateRange
      ? `_${formatDate(options.dateRange.start, 'yyyy-MM-dd')}_to_${formatDate(options.dateRange.end, 'yyyy-MM-dd')}`
      : '';
    const fileName = `financeflow_export${dateRange}_${timestamp}.${fileExtension}`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write file
    await FileSystem.writeAsStringAsync(filePath, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Get file size
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    const size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

    return {
      filePath,
      fileName,
      size,
      format: options.format,
    };
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

/**
 * Exports and shares the file
 */
export const exportAndShare = async (
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  savingsGoals: SavingsGoal[],
  settings: UserSettings,
  options: ExportOptions
): Promise<boolean> => {
  try {
    const result = await exportData(
      transactions,
      categories,
      budgets,
      savingsGoals,
      settings,
      options
    );

    if (!result) {
      return false;
    }

    const sharingAvailable = await Sharing.isAvailableAsync();
    if (sharingAvailable) {
      await Sharing.shareAsync(result.filePath, {
        mimeType: getMimeType(options.format),
        dialogTitle: 'Export Financial Data',
        UTI: getUTI(options.format),
      });
      return true;
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Export and share error:', error);
    throw error;
  }
};

/**
 * Gets MIME type for export format
 */
const getMimeType = (format: ExportFormat): string => {
  switch (format) {
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';
    case 'html':
      return 'text/html';
    default:
      return 'text/plain';
  }
};

/**
 * Gets UTI (Uniform Type Identifier) for iOS sharing
 */
const getUTI = (format: ExportFormat): string => {
  switch (format) {
    case 'csv':
      return 'public.comma-separated-values-text';
    case 'json':
      return 'public.json';
    case 'html':
      return 'public.html';
    default:
      return 'public.plain-text';
  }
};

/**
 * Formats file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Generates a quick summary report
 */
export const generateSummaryReport = (
  transactions: Transaction[],
  categories: Category[],
  settings: UserSettings
): string => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const categoryBreakdown = categories
    .map((category) => {
      const categoryTransactions = transactions.filter(
        (t) => t.categoryId === category.id && t.type === 'expense'
      );
      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      return { category: category.name, total, count: categoryTransactions.length };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);

  let report = `FINANCIAL SUMMARY REPORT\n`;
  report += `Generated: ${formatDate(new Date(), 'MMMM dd, yyyy HH:mm')}\n\n`;
  report += `OVERVIEW\n`;
  report += `Total Income: ${formatCurrency(totalIncome, settings.currency)}\n`;
  report += `Total Expenses: ${formatCurrency(totalExpenses, settings.currency)}\n`;
  report += `Net Balance: ${formatCurrency(balance, settings.currency)}\n`;
  report += `Total Transactions: ${transactions.length}\n\n`;

  if (categoryBreakdown.length > 0) {
    report += `TOP SPENDING CATEGORIES\n`;
    categoryBreakdown.slice(0, 5).forEach((item, index) => {
      const percentage = (item.total / totalExpenses) * 100;
      report += `${index + 1}. ${item.category}: ${formatCurrency(item.total, settings.currency)} (${percentage.toFixed(1)}%)\n`;
    });
  }

  return report;
};

export default {
  exportData,
  exportAndShare,
  formatFileSize,
  generateSummaryReport,
};
