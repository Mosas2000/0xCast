import { useSettings } from '../hooks/useSettings';

export function NotificationPreferences() {
    const { settings, updateSetting } = useSettings();

    const handleToggle = (key: keyof typeof settings.notifications) => {
        updateSetting('notifications', {
            ...settings.notifications,
            [key]: !settings.notifications[key],
        });
    };

    const preferences = [
        { key: 'wins' as const, label: 'Winning Stakes', description: 'Notify when you win a market' },
        { key: 'resolutions' as const, label: 'Market Resolutions', description: 'Notify when markets are resolved' },
        { key: 'newMarkets' as const, label: 'New Markets', description: 'Notify when new markets are created' },
        { key: 'endingSoon' as const, label: 'Ending Soon', description: 'Notify when markets are ending within 24h' },
    ];

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-400">Choose which notifications you want to receive</p>

            {preferences.map((pref) => (
                <div key={pref.key} className="flex items-start justify-between p-4 bg-slate-900/50 rounded-lg">
                    <div className="flex-1">
                        <p className="font-medium text-white">{pref.label}</p>
                        <p className="text-sm text-slate-400 mt-1">{pref.description}</p>
                    </div>

                    <button
                        onClick={() => handleToggle(pref.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications[pref.key] ? 'bg-primary-600' : 'bg-slate-700'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications[pref.key] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            ))}
        </div>
    );
}
