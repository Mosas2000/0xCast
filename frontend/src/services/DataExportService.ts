import { GDPRComplianceService } from './GDPRComplianceService';
import { SecureStorageService } from './SecureStorageService';
import type { JsonValue, JsonObject } from '@/types/common';

type ExportData = Record<string, JsonValue>;

export interface ExportFormat {
  type: 'json' | 'csv' | 'pdf';
  includeMetadata: boolean;
  includePII: boolean;
}

export interface ExportRequest {
  userId: string;
  format: ExportFormat;
  categories?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface ExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}

export class DataExportService {
  static async exportUserData(request: ExportRequest): Promise<ExportResult> {
    try {
      const consent = GDPRComplianceService.getUserConsent();
      if (!consent) {
        return {
          success: false,
          error: 'No consent provided for data export',
        };
      }

      const userData = this.collectUserData(request);

      switch (request.format.type) {
        case 'json':
          return this.exportAsJSON(userData, request);
        case 'csv':
          return this.exportAsCSV(userData, request);
        case 'pdf':
          return this.exportAsPDF(userData, request);
        default:
          return {
            success: false,
            error: 'Unsupported export format',
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  private static collectUserData(request: ExportRequest): ExportData {
    const data: ExportData = {
      exportDate: new Date().toISOString(),
      userId: request.userId,
      consent: GDPRComplianceService.getUserConsent() as JsonValue,
    };

    if (typeof localStorage === 'undefined') {
      return data;
    }

    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      try {
        if (key.startsWith('secure_')) {
          const entry = SecureStorageService.getItem(key.substring(7));
          if (entry) {
            data[key.substring(7)] = entry;
          }
        } else if (key.startsWith('0xcast_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              data[key] = JSON.parse(stored);
            } catch {
              data[key] = stored;
            }
          }
        }
      } catch {
        continue;
      }
    }

    data.transactions = this.getTransactions();
    data.stakeHistory = this.getStakeHistory();
    data.preferences = this.getPreferences();

    return data;
  }

  private static getTransactions(): JsonValue[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const stored = localStorage.getItem('tx_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static getStakeHistory(): JsonValue[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const stored = localStorage.getItem('stake_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static getPreferences(): Record<string, JsonValue> {
    const preferences: Record<string, JsonValue> = {};
    
    try {
      if (typeof localStorage === 'undefined') return preferences;
      
      const prefKeys = [
        '0xcast_theme',
        '0xcast_network',
        'notification_preferences',
        'filter_presets',
      ];

      for (const key of prefKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            preferences[key] = JSON.parse(stored);
          } catch {
            preferences[key] = stored;
          }
        }
      }
    } catch {
      // Ignore errors
    }

    return preferences;
  }

  private static exportAsJSON(
    data: ExportData,
    request: ExportRequest
  ): ExportResult {
    try {
      const exportData = request.format.includeMetadata
        ? {
            ...data,
            metadata: {
              exportedAt: new Date().toISOString(),
              format: 'json',
              version: '1.0.0',
            },
          }
        : data;

      const json = JSON.stringify(exportData, null, 2);
      const filename = `user_data_${request.userId}_${Date.now()}.json`;

      return {
        success: true,
        data: json,
        filename,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to export as JSON',
      };
    }
  }

  private static exportAsCSV(
    data: ExportData,
    request: ExportRequest
  ): ExportResult {
    try {
      const flatData = this.flattenObject(data);
      const headers = Object.keys(flatData);
      const values = Object.values(flatData);

      const csv = [
        headers.join(','),
        values.map(v => this.formatCSVValue(v)).join(','),
      ].join('\n');

      const filename = `user_data_${request.userId}_${Date.now()}.csv`;

      return {
        success: true,
        data: csv,
        filename,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to export as CSV',
      };
    }
  }

  private static exportAsPDF(
    data: ExportData,
    _request: ExportRequest
  ): ExportResult {
    return {
      success: false,
      error: 'PDF export not yet implemented. Use JSON or CSV format.',
    };
  }

  private static flattenObject(
    obj: Record<string, JsonValue>,
    prefix: string = ''
  ): Record<string, string | number | boolean> {
    const result: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        result[newKey] = '';
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, this.flattenObject(value as Record<string, JsonValue>, newKey));
      } else if (Array.isArray(value)) {
        result[newKey] = JSON.stringify(value);
      } else {
        result[newKey] = value as string | number | boolean;
      }
    }

    return result;
  }

  private static formatCSVValue(value: string | number | boolean): string {
    if (value === null || value === undefined) {
      return '';
    }

    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
  }

  static downloadExport(result: ExportResult): void {
    if (!result.success || !result.data || !result.filename) {
      console.error('Cannot download: export failed');
      return;
    }

    const blob = new Blob([result.data], {
      type: result.filename.endsWith('.json')
        ? 'application/json'
        : 'text/csv',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
