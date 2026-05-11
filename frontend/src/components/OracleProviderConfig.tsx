import React, { useState } from 'react';
import { OracleProvider } from '@/types/oracle';

interface OracleProviderConfigProps {
  onAddProvider: (provider: OracleProvider) => void;
  onUpdateProvider: (providerId: string, updates: Partial<OracleProvider>) => void;
  onRemoveProvider: (providerId: string) => void;
  providers: OracleProvider[];
}

export const OracleProviderConfig: React.FC<OracleProviderConfigProps> = ({
  onAddProvider,
  onUpdateProvider,
  onRemoveProvider,
  providers,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    url: '',
    priority: 50,
    enabled: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProvider: OracleProvider = {
      ...formData,
      healthScore: 100,
      errorCount: 0,
      successCount: 0,
      lastUpdate: Date.now(),
    };

    onAddProvider(newProvider);
    setFormData({
      id: '',
      name: '',
      url: '',
      priority: 50,
      enabled: true,
    });
    setShowAddForm(false);
  };

  const handleToggleEnabled = (providerId: string, currentEnabled: boolean) => {
    onUpdateProvider(providerId, { enabled: !currentEnabled });
  };

  const handlePriorityChange = (providerId: string, priority: number) => {
    onUpdateProvider(providerId, { priority });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Oracle Provider Configuration</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showAddForm ? 'Cancel' : 'Add Provider'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium mb-4">Add New Provider</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider ID
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="chainlink-btc"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="Chainlink BTC/USD"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API URL
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="https://api.example.com/price"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="w-full border rounded px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Higher priority providers are preferred when selecting oracles
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                Enable provider immediately
              </label>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Provider
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h4 className="font-medium">Configured Providers</h4>
        </div>
        <div className="divide-y">
          {providers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No providers configured. Add a provider to get started.
            </div>
          ) : (
            providers.map((provider) => (
              <div key={provider.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h5 className="font-medium">{provider.name}</h5>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          provider.enabled
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {provider.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      <div>ID: {provider.id}</div>
                      <div className="truncate">URL: {provider.url}</div>
                    </div>

                    <div className="mt-3 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Priority:</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={provider.priority}
                          onChange={(e) => handlePriorityChange(provider.id, Number(e.target.value))}
                          className="w-20 border rounded px-2 py-1 text-sm"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Health:</span>
                        <span className="text-sm font-medium">{provider.healthScore}%</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Success:</span>
                        <span className="text-sm font-medium">{provider.successCount}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Errors:</span>
                        <span className="text-sm font-medium text-red-600">{provider.errorCount}</span>
                      </div>
                    </div>

                    {provider.lastError && (
                      <div className="mt-2 text-sm text-red-600">
                        Last error: {provider.lastError}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleToggleEnabled(provider.id, provider.enabled)}
                      className={`px-3 py-1 text-sm rounded ${
                        provider.enabled
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {provider.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => onRemoveProvider(provider.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
