import React, { useState } from 'react';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import type { NotificationType, NotificationChannel, NotificationFrequency } from '../types/notifications';

const NOTIFICATION_TYPES: NotificationType[] = [
  'price_movement',
  'market_expiry',
  'resolution',
  'liquidity_reward',
  'portfolio_update',
  'position_change',
  'system_alert',
];

const CHANNELS: NotificationChannel[] = ['in_app', 'email', 'push'];

const FREQUENCIES: NotificationFrequency[] = ['instant', 'daily', 'weekly', 'never'];

interface NotificationPreferencesProps {
  userId: string;
}

export default function NotificationPreferences({
  userId,
}: NotificationPreferencesProps) {
  const {
    preferences,
    isLoading,
    error,
    setPreference,
    togglePreference,
    setFrequency,
  } = useNotificationPreferences(userId);

  const [activeTab, setActiveTab] = useState<NotificationChannel>('in_app');
  const [expandedType, setExpandedType] = useState<NotificationType | null>(null);

  const getTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
      price_movement: 'Price Movements',
      market_expiry: 'Market Expiry',
      resolution: 'Market Resolution',
      liquidity_reward: 'Liquidity Rewards',
      portfolio_update: 'Portfolio Updates',
      position_change: 'Position Changes',
      system_alert: 'System Alerts',
    };
    return labels[type];
  };

  const getFrequencyLabel = (freq: NotificationFrequency): string => {
    const labels: Record<NotificationFrequency, string> = {
      instant: 'Instantly',
      daily: 'Daily Digest',
      weekly: 'Weekly Digest',
      never: 'Never',
    };
    return labels[freq];
  };

  const handleToggle = async (type: NotificationType) => {
    const pref = preferences.find(
      p =>
        p.userId === userId &&
        p.type === type &&
        p.channel === activeTab
    );

    if (pref) {
      await togglePreference(pref.id);
    } else {
      await setPreference(type, activeTab, 'instant', true);
    }
  };

  const handleFrequencyChange = async (
    type: NotificationType,
    frequency: NotificationFrequency
  ) => {
    const pref = preferences.find(
      p =>
        p.userId === userId &&
        p.type === type &&
        p.channel === activeTab
    );

    if (pref) {
      await setFrequency(pref.id, frequency);
    } else {
      await setPreference(type, activeTab, frequency, true);
    }
  };

  const isEnabled = (type: NotificationType): boolean => {
    const pref = preferences.find(
      p =>
        p.userId === userId &&
        p.type === type &&
        p.channel === activeTab
    );
    return pref?.enabled ?? false;
  };

  const getFrequency = (type: NotificationType): NotificationFrequency => {
    const pref = preferences.find(
      p =>
        p.userId === userId &&
        p.type === type &&
        p.channel === activeTab
    );
    return pref?.frequency ?? 'instant';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Notification Preferences
          </h2>
        </div>

        <div className="border-b px-6 py-4">
          <div className="flex gap-2">
            {CHANNELS.map(channel => (
              <button
                key={channel}
                onClick={() => setActiveTab(channel)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === channel
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {channel === 'in_app' ? 'In-App' : channel === 'email' ? 'Email' : 'Push'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {isLoading && <p className="text-gray-500">Loading...</p>}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {NOTIFICATION_TYPES.map(type => {
              const enabled = isEnabled(type);
              const frequency = getFrequency(type);

              return (
                <div
                  key={type}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => handleToggle(type)}
                        className="rounded"
                      />
                      <label className="font-medium text-gray-900 cursor-pointer">
                        {getTypeLabel(type)}
                      </label>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedType(
                          expandedType === type ? null : type
                        )
                      }
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedType === type ? '−' : '+'}
                    </button>
                  </div>

                  {expandedType === type && enabled && (
                    <div className="mt-4 pl-9 border-t pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency
                      </label>
                      <select
                        value={frequency}
                        onChange={e =>
                          handleFrequencyChange(
                            type,
                            e.target.value as NotificationFrequency
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {FREQUENCIES.map(freq => (
                          <option key={freq} value={freq}>
                            {getFrequencyLabel(freq)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
