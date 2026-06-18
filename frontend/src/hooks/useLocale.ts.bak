import { useTranslation } from 'react-i18next';
import { 
  formatCurrency, 
  formatNumber, 
  formatDate, 
  formatDateTime, 
  formatTime, 
  formatPercentage,
  formatStx as formatStxUtil
} from '@/utils/i18n/formatters';

export function useLocale() {
  const { i18n } = useTranslation();
  const locale = i18n.language;

  return {
    locale,
    formatCurrency: (amount: number, currency: string = 'USD', decimals: number = 2) =>
      formatCurrency(amount, locale, currency, decimals),
    formatNumber: (value: number, decimals?: number) =>
      formatNumber(value, locale, decimals),
    formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, locale, options),
    formatDateTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDateTime(date, locale, options),
    formatTime: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatTime(date, locale, options),
    formatPercentage: (value: number, decimals: number = 2) =>
      formatPercentage(value, locale, decimals),
    formatStx: (amount: number, decimals: number = 2) =>
      formatStxUtil(amount, locale, decimals),
  };
}
