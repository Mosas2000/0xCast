import { useState, useCallback, useEffect } from 'react';
import { NotificationService } from '@/services/NotificationService';
import type {
  NotificationPreference,
  NotificationType,
  NotificationChannel,
  NotificationFrequency,
} from '@/types/notifications';

interface UseNotificationPreferencesReturn {
  preferences: NotificationPreference[];
  isLoading: boolean;
  error: string | null;
  setPreference: (
    type: NotificationType,
    channel: NotificationChannel,
    frequency: NotificationFrequency,
    enabled: boolean
  ) => Promise<void>;
  updatePreference: (
    preferenceId: string,
    frequency?: NotificationFrequency,
    enabled?: boolean
  ) => Promise<void>;
  deletePreference: (preferenceId: string) => Promise<void>;
  getPreference: (type: NotificationType, channel: NotificationChannel) => NotificationPreference | undefined;
  togglePreference: (preferenceId: string) => Promise<void>;
  setFrequency: (preferenceId: string, frequency: NotificationFrequency) => Promise<void>;
  refresh: (userId: string) => Promise<void>;
}

export function useNotificationPreferences(
  userId: string
): UseNotificationPreferencesReturn {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setPreference = useCallback(
    async (
      type: NotificationType,
      channel: NotificationChannel,
      frequency: NotificationFrequency,
      enabled: boolean
    ) => {
      try {
        setError(null);
        const preference = await NotificationService.setPreference({
          userId,
          type,
          channel,
          frequency,
          enabled,
        });

        setPreferences(prev => {
          const existing = prev.findIndex(
            p =>
              p.userId === userId &&
              p.type === type &&
              p.channel === channel
          );

          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = preference;
            return updated;
          }

          return [...prev, preference];
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to set preference');
      }
    },
    [userId]
  );

  const updatePreference = useCallback(
    async (
      preferenceId: string,
      frequency?: NotificationFrequency,
      enabled?: boolean
    ) => {
      try {
        setError(null);
        const updated = await NotificationService.updatePreference(preferenceId, {
          frequency,
          enabled,
        });

        if (updated) {
          setPreferences(prev =>
            prev.map(p => (p.id === preferenceId ? updated : p))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update preference');
      }
    },
    []
  );

  const deletePreference = useCallback(async (preferenceId: string) => {
    try {
      setError(null);
      await NotificationService.deletePreference(preferenceId);
      setPreferences(prev => prev.filter(p => p.id !== preferenceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete preference');
    }
  }, []);

  const getPreference = useCallback(
    (type: NotificationType, channel: NotificationChannel) => {
      return preferences.find(
        p =>
          p.userId === userId &&
          p.type === type &&
          p.channel === channel
      );
    },
    [preferences, userId]
  );

  const togglePreference = useCallback(
    async (preferenceId: string) => {
      const preference = preferences.find(p => p.id === preferenceId);

      if (preference) {
        await updatePreference(preferenceId, undefined, !preference.enabled);
      }
    },
    [preferences, updatePreference]
  );

  const setFrequency = useCallback(
    async (preferenceId: string, frequency: NotificationFrequency) => {
      await updatePreference(preferenceId, frequency);
    },
    [updatePreference]
  );

  const refresh = useCallback(async (refreshUserId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await NotificationService.getUserPreferences(refreshUserId);
      setPreferences(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh(userId);
  }, [userId]);

  return {
    preferences,
    isLoading,
    error,
    setPreference,
    updatePreference,
    deletePreference,
    getPreference,
    togglePreference,
    setFrequency,
    refresh,
  };
}
