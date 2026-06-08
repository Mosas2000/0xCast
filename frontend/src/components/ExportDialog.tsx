import React, { useState } from 'react';
import type { ExportType, ExportOptions as ExportOptionsType } from '@/types/export';
import { ExportFormat } from '@/types/export';
import type { TransactionData, Portfolio, Position, RewardData } from '@/types/transactions';
import { useExport } from '@/hooks/useExport';
import ExportOptions from './ExportOptions';
import ExportProgress from './ExportProgress';

interface ExportDialogProps {
  onClose: () => void;
  isOpen: boolean;
  defaultType?: ExportType;
  data: {
    transactions?: TransactionData[];
    positions?: Position[];
    portfolio?: Portfolio;
    rewards?: RewardData[];
  };
}

type DialogStep = 'select' | 'options' | 'progress' | 'complete' | 'error';

export default function ExportDialog({
  onClose,
  isOpen,
  defaultType = 'transactions',
  data,
}: ExportDialogProps) {
  const [step, setStep] = useState<DialogStep>('select');
  const [selectedType, setSelectedType] = useState<ExportType>(defaultType);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [taxYear, setTaxYear] = useState<number>(new Date().getFullYear());
  const { isExporting, progress, error, exportTransactions, exportPositions, exportPortfolio, exportRewards, exportTaxReport, reset } = useExport();

  const handleExportTypeSelect = (type: ExportType) => {
    setSelectedType(type);
    setStep('options');
  };

  const handleExportOptionsConfirm = async (options: ExportOptionsType) => {
    setSelectedFormat(options.format);
    setStep('progress');

    try {
      switch (selectedType) {
        case 'transactions':
          await exportTransactions(data.transactions || [], options);
          break;
        case 'positions':
          await exportPositions(data.positions || [], options);
          break;
        case 'portfolio':
          await exportPortfolio(data.portfolio || {}, options);
          break;
        case 'rewards':
          await exportRewards(data.rewards || [], options);
          break;
        case 'tax_report':
          await exportTaxReport(data.transactions || [], taxYear, options);
          break;
        default:
          throw new Error('Invalid export type');
      }
      setStep('complete');
    } catch (err) {
      setStep('error');
    }
  };

  const handleClose = () => {
    reset();
    setStep('select');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Select what you would like to export:</p>

              {data.transactions && data.transactions.length > 0 && (
                <button
                  onClick={() => handleExportTypeSelect('transactions')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="font-medium text-gray-900">Transaction History</div>
                  <div className="text-xs text-gray-500">{data.transactions.length} transactions</div>
                </button>
              )}

              {data.positions && data.positions.length > 0 && (
                <button
                  onClick={() => handleExportTypeSelect('positions')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="font-medium text-gray-900">Market Positions</div>
                  <div className="text-xs text-gray-500">{data.positions.length} positions</div>
                </button>
              )}

              {data.portfolio && (
                <button
                  onClick={() => handleExportTypeSelect('portfolio')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="font-medium text-gray-900">Portfolio Summary</div>
                  <div className="text-xs text-gray-500">Complete portfolio snapshot</div>
                </button>
              )}

              {data.rewards && data.rewards.length > 0 && (
                <button
                  onClick={() => handleExportTypeSelect('rewards')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="font-medium text-gray-900">Reward History</div>
                  <div className="text-xs text-gray-500">{data.rewards.length} rewards</div>
                </button>
              )}

              {data.transactions && data.transactions.length > 0 && (
                <button
                  onClick={() => handleExportTypeSelect('tax_report')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="font-medium text-gray-900">Tax Report</div>
                  <div className="text-xs text-gray-500">For {taxYear}</div>
                </button>
              )}
            </div>
          )}

          {step === 'options' && (
            <ExportOptions
              exportType={selectedType}
              onConfirm={handleExportOptionsConfirm}
              onBack={() => setStep('select')}
              onTaxYearChange={setTaxYear}
              currentYear={taxYear}
            />
          )}

          {step === 'progress' && (
            <ExportProgress progress={progress} isExporting={isExporting} />
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-12 h-12 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Complete</h3>
              <p className="text-sm text-gray-600 mb-6">Your file has been downloaded successfully.</p>
              <button
                onClick={handleClose}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Done
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-12 h-12 text-red-500 mx-auto" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Failed</h3>
              <p className="text-sm text-gray-600 mb-6">{error || 'An unexpected error occurred.'}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                >
                  Back
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
