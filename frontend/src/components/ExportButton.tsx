import { useState } from 'react';
import { exportPositionsCSV, exportMarketsCSV, exportTransactionsCSV, downloadCSV } from '../utils/dataExport';

interface ExportButtonProps {
    data: any[];
    filename: string;
    type: 'positions' | 'markets' | 'transactions';
    label?: string;
    className?: string;
}

export function ExportButton({ data, filename, type, label, className = '' }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);

        try {
            // Small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 500));

            let csvContent: string;
            switch (type) {
                case 'positions':
                    csvContent = exportPositionsCSV(data);
                    break;
                case 'markets':
                    csvContent = exportMarketsCSV(data);
                    break;
                case 'transactions':
                    csvContent = exportTransactionsCSV(data);
                    break;
                default:
                    throw new Error('Invalid export type');
            }

            downloadCSV(csvContent, filename);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting || data.length === 0}
            className={`w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${className}`.trim()}
        >
            {isExporting ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Exporting...</span>
                </>
            ) : success ? (
                <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Exported!</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{label || `Export ${type}`}</span>
                </>
            )}
        </button>
    );
}
