import React, { useState } from 'react';
import { useScheduledExports } from '../hooks/useScheduledExports';
import type { ScheduledExport, ExportType, ExportSchedule } from '../types/export';

export default function ScheduledExportManager() {
  const {
    exports,
    isLoading,
    error,
    addScheduledExport,
    removeScheduledExport,
    pauseExport,
    resumeExport,
    getNextRunTime,
  } = useScheduledExports();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    exportType: 'transactions' as ExportType,
    frequency: 'weekly' as ExportSchedule['frequency'],
    format: 'csv' as const,
    dayOfWeek: 0,
    time: { hours: 0, minutes: 0 },
  });

  const handleAddExport = async () => {
    const newExport: ScheduledExport = {
      id: '',
      exportType: formData.exportType,
      format: formData.format,
      schedule: {
        frequency: formData.frequency,
        dayOfWeek: formData.dayOfWeek,
        time: formData.time,
      },
      createdAt: '',
      lastRunAt: null,
      nextRunAt: '',
      isActive: true,
    };

    try {
      await addScheduledExport(newExport);
      setShowForm(false);
      setFormData({
        exportType: 'transactions',
        frequency: 'weekly',
        format: 'csv',
        dayOfWeek: 0,
        time: { hours: 0, minutes: 0 },
      });
    } catch (err) {
      console.error('Failed to add scheduled export:', err);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-gray-600">Loading scheduled exports...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Scheduled Exports</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : 'Add Schedule'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Export Type</label>
            <select
              value={formData.exportType}
              onChange={(e) => setFormData({ ...formData, exportType: e.target.value as ExportType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="transactions">Transactions</option>
              <option value="positions">Positions</option>
              <option value="portfolio">Portfolio</option>
              <option value="rewards">Rewards</option>
              <option value="tax_report">Tax Report</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Format</label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value as 'csv' | 'json' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as ExportSchedule['frequency'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Day of Week</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">Hour</label>
              <input
                type="number"
                min="0"
                max="23"
                value={formData.time.hours}
                onChange={(e) => setFormData({
                  ...formData,
                  time: { ...formData.time, hours: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">Minute</label>
              <input
                type="number"
                min="0"
                max="59"
                value={formData.time.minutes}
                onChange={(e) => setFormData({
                  ...formData,
                  time: { ...formData.time, minutes: parseInt(e.target.value) || 0 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExport}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create Schedule
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {exports.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No scheduled exports yet</p>
        ) : (
          exports.map(exportSchedule => (
            <div key={exportSchedule.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {exportSchedule.exportType.replace('_', ' ').toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {exportSchedule.schedule.frequency.charAt(0).toUpperCase() + exportSchedule.schedule.frequency.slice(1)} export
                    {exportSchedule.lastRunAt && ` • Last run: ${new Date(exportSchedule.lastRunAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {exportSchedule.isActive ? (
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      Paused
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                Next run: {getNextRunTime(exportSchedule.schedule).toLocaleString()}
              </div>

              <div className="flex gap-2">
                {exportSchedule.isActive ? (
                  <button
                    onClick={() => pauseExport(exportSchedule.id)}
                    className="flex-1 text-sm px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => resumeExport(exportSchedule.id)}
                    className="flex-1 text-sm px-3 py-1.5 border border-green-300 text-green-700 rounded hover:bg-green-50 transition"
                  >
                    Resume
                  </button>
                )}
                <button
                  onClick={() => removeScheduledExport(exportSchedule.id)}
                  className="flex-1 text-sm px-3 py-1.5 border border-red-300 text-red-700 rounded hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
