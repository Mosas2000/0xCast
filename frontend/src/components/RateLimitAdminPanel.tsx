import React, { useState } from 'react';
import { rateLimitService } from '@/services/RateLimitService';
import { DEFAULT_RATE_LIMITS } from '@/config/rateLimits';

interface RateLimitConfigForm {
  action: string;
  maxRequests: number;
  windowMs: number;
  cooldownMs: number;
}

export const RateLimitAdminPanel: React.FC = () => {
  const [selectedAction, setSelectedAction] = useState<string>('stake');
  const [formData, setFormData] = useState<RateLimitConfigForm>({
    action: 'stake',
    maxRequests: 10,
    windowMs: 60000,
    cooldownMs: 5000,
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const actions = Object.keys(DEFAULT_RATE_LIMITS);

  const handleActionChange = (action: string) => {
    setSelectedAction(action);
    const config = rateLimitService.getConfig(action);
    if (config) {
      setFormData({
        action,
        maxRequests: config.maxRequests,
        windowMs: config.windowMs,
        cooldownMs: config.cooldownMs || 0,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      rateLimitService.setConfig(formData.action, {
        maxRequests: formData.maxRequests,
        windowMs: formData.windowMs,
        cooldownMs: formData.cooldownMs,
      });
      
      setMessage({
        type: 'success',
        text: `Rate limit configuration updated for ${formData.action}`,
      });
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update configuration',
      });
    }
  };

  const handleReset = () => {
    const defaultConfig = DEFAULT_RATE_LIMITS[selectedAction];
    if (defaultConfig) {
      setFormData({
        action: selectedAction,
        maxRequests: defaultConfig.maxRequests,
        windowMs: defaultConfig.windowMs,
        cooldownMs: defaultConfig.cooldownMs || 0,
      });
      
      rateLimitService.setConfig(selectedAction, defaultConfig);
      
      setMessage({
        type: 'success',
        text: `Reset to default configuration for ${selectedAction}`,
      });
      
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const stats = rateLimitService.getStats();

  return (
    <div className="rate-limit-admin-panel p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Rate Limit Administration</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Total Entries</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalEntries}</div>
        </div>

        <div className="stat-card p-4 bg-red-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Blocked Users</div>
          <div className="text-2xl font-bold text-red-600">{stats.blockedUsers}</div>
        </div>

        <div className="stat-card p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Active Windows</div>
          <div className="text-2xl font-bold text-green-600">{stats.activeWindows}</div>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Action
          </label>
          <select
            value={selectedAction}
            onChange={(e) => handleActionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {actions.map((action) => (
              <option key={action} value={action}>
                {action.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Requests
          </label>
          <input
            type="number"
            min="1"
            value={formData.maxRequests}
            onChange={(e) => setFormData({ ...formData, maxRequests: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Window (milliseconds)
          </label>
          <input
            type="number"
            min="1000"
            step="1000"
            value={formData.windowMs}
            onChange={(e) => setFormData({ ...formData, windowMs: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            {Math.round(formData.windowMs / 1000)} seconds
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cooldown (milliseconds)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={formData.cooldownMs}
            onChange={(e) => setFormData({ ...formData, cooldownMs: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            {Math.round(formData.cooldownMs / 1000)} seconds
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Update Configuration
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Reset to Default
          </button>
        </div>
      </form>
    </div>
  );
};
