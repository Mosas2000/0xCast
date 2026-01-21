import { useState, useEffect, useCallback } from 'react';

export interface UserSettings {
    theme: 'dark' | 'light';
    notifications: {
        wins: boolean;
        resolutions: boolean;
        newMarkets: boolean;
        endingSoon: boolean;
    };
    displayCurrency: 'STX' | 'USD';
    dateFormat: 'relative' | 'absolute';
    viewMode: 'compact' | 'expanded';
}

const DEFAULT_SETTINGS: UserSettings = {
    theme: 'dark',
    notifications: {
        wins: true,
        resolutions: true,
        newMarkets: false,
        endingSoon: true,
    },
    displayCurrency: 'STX',
    dateFormat: 'relative',
    viewMode: 'expanded',
};

const STORAGE_KEY = 'oxcast_settings';

/**
 * Hook for managing user settings
 * @returns Settings state and update function
 */
export function useSettings() {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings({ ...DEFAULT_SETTINGS, ...parsed });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }, []);

    // Save to localStorage whenever settings change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }, [settings]);

    const updateSetting = useCallback(<K extends keyof UserSettings>(
        key: K,
        value: UserSettings[K]
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        settings,
        updateSetting,
        resetSettings,
    };
}
