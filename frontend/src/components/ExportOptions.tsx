import React, { useState } from 'react';
import type { ExportFormat, ExportType, ExportOptions as ExportOptionsType } from '../types/export';

interface ExportOptionsProps {
  exportType: ExportType;
  onConfirm: (options: ExportOptionsType) => void;
  onBack: () => void;
  onTaxYearChange?: (year: number) => void;
  currentYear?: number;
}

export default function ExportOptions({
  exportType,
  onConfirm,
  onBack,
  onTaxYearChange,
  currentYear = new Date().getFullYear(),
}: ExportOptionsProps) {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const handleConfirm = () => {
    const options: ExportOptionsType = {
      format,
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    };
    onConfirm(options);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    if (onTaxYearChange) {
      onTaxYearChange(year);
    }
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">File Format</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="csv"
              checked={format === 'csv'}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              className="rounded border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">CSV (spreadsheet)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="json"
              checked={format === 'json'}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              className="rounded border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">JSON (structured)</span>
          </label>
        </div>
      </div>

      {exportType === 'tax_report' && (
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Tax Year</label>
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      {['transactions', 'positions'].includes(exportType) && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">From Date (Optional)</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">To Date (Optional)</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Export
        </button>
      </div>
    </div>
  );
}
