import React from 'react';
import { Card } from './Card';
import { ExportButton } from './ExportButton';
import { Database, FileJson, Table } from 'lucide-react';

export const DataExportSection: React.FC = () => {
    return (
        <Card className="bg-indigo-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Database className="w-32 h-32" />
            </div>

            <div className="relative z-10 px-2 py-4">
                <h4 className="text-xl font-bold mb-2">Export Platform Data</h4>
                <p className="text-indigo-200 text-sm mb-6 max-w-md">
                    Download comprehensive raw data in CSV or PDF format for deep analysis and external reporting.
                </p>

                <div className="flex flex-wrap gap-4">
                    <ExportButton onExport={() => { }} />
                    <button className="flex items-center px-4 py-2 bg-indigo-800/50 hover:bg-indigo-700 transition-colors rounded-xl text-sm font-bold">
                        <FileJson className="w-4 h-4 mr-2" />
                        API Access
                    </button>
                </div>
            </div>
        </Card>
    );
};
