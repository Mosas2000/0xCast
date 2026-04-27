import { ExportFormat } from '../types/export';
import i18n from '../i18n/config';
import { formatDate as formatDateI18n, formatDateTime as formatDateTimeI18n } from './i18n/formatters';

export function downloadFile(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function convertToCSV(headers: string[], rows: any[][]): string {
  const csvHeaders = headers.map(header => `"${header}"`).join(',');
  const csvRows = rows.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) return '';
      const stringCell = String(cell);
      if (stringCell.includes(',') || stringCell.includes('"') || stringCell.includes('\n')) {
        return `"${stringCell.replace(/"/g, '""')}"`;
      }
      return stringCell;
    }).join(',')
  );
  return [csvHeaders, ...csvRows].join('\n');
}

export function convertToJSON(data: any, pretty: boolean = true): string {
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

export function formatCurrency(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return formatDateI18n(date, i18n.language, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatDateTime(date: Date | string): string {
  return formatDateTimeI18n(date, i18n.language);
}

export function getFileNameWithTimestamp(baseName: string, format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return `${baseName}-${timestamp}.${format}`;
}

export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case ExportFormat.CSV:
      return 'text/csv;charset=utf-8';
    case ExportFormat.JSON:
      return 'application/json;charset=utf-8';
    case ExportFormat.PDF:
      return 'application/pdf';
    default:
      return 'text/plain';
  }
}

export function calculateGainLoss(proceeds: number, cost: number): number {
  return proceeds - cost;
}

export function validateDateRange(startDate?: Date, endDate?: Date): boolean {
  if (!startDate || !endDate) return true;
  return startDate <= endDate;
}

export function getDateRangeString(startDate?: Date, endDate?: Date): string {
  if (!startDate || !endDate) return i18n.t('common:time.allTime', 'All Time');
  return `${formatDate(startDate)} ${i18n.t('common:time.to', 'to')} ${formatDate(endDate)}`;
}

export function filterByDateRange(data: any[], dateField: string, startDate?: Date, endDate?: Date): any[] {
  if (!startDate || !endDate) return data;
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

export function aggregateByMonth(data: any[], dateField: string, valueField: string): Map<string, number> {
  const aggregated = new Map<string, number>();
  
  data.forEach(item => {
    const date = new Date(item[dateField]);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = aggregated.get(monthKey) || 0;
    aggregated.set(monthKey, current + item[valueField]);
  });
  
  return aggregated;
}

export function sortByDate(data: any[], dateField: string, descending: boolean = true): any[] {
  return [...data].sort((a, b) => {
    const dateA = new Date(a[dateField]).getTime();
    const dateB = new Date(b[dateField]).getTime();
    return descending ? dateB - dateA : dateA - dateB;
  });
}
