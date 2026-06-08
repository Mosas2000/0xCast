import React from 'react';
import type { ExportProgress as ExportProgressType } from '@/types/export';

interface ExportProgressProps {
  progress: ExportProgressType;
  isExporting: boolean;
}

export default function ExportProgress({ progress, isExporting }: ExportProgressProps) {
  const progressPercentage = progress.progress || 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isExporting ? 'Preparing Export' : 'Export Status'}
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {progress.totalRecords > 0 && (
        <div className="text-center text-sm text-gray-600">
          Processing {progress.processedRecords} of {progress.totalRecords} records
        </div>
      )}

      {progress.status === 'processing' && (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
        </div>
      )}

      {progress.status === 'completed' && (
        <div className="text-center text-sm text-green-600">
          Export completed successfully
        </div>
      )}

      {progress.status === 'failed' && (
        <div className="text-center text-sm text-red-600">
          {progress.error || 'Export failed'}
        </div>
      )}
    </div>
  );
}
