import React from 'react';
import { Download, FileText, Share2 } from 'lucide-react';

interface ExportButtonProps {
    onExport: (format: 'csv' | 'pdf') => void;
    loading?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
    onExport,
    loading = false
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
                <Download className="w-4 h-4 mr-2" />
                Export Report
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <button
                            onClick={() => { onExport('csv'); setIsOpen(false); }}
                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            <FileText className="w-4 h-4 mr-3" />
                            Export as CSV
                        </button>
                        <button
                            onClick={() => { onExport('pdf'); setIsOpen(false); }}
                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                            <Share2 className="w-4 h-4 mr-3" />
                            Export as PDF
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
