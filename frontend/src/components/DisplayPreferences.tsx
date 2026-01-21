import { useSettings } from '../hooks/useSettings';

export function DisplayPreferences() {
    const { settings, updateSetting } = useSettings();

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-400">Customize how information is displayed</p>

            {/* Currency Format */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Currency Display</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => updateSetting('displayCurrency', 'STX')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.displayCurrency === 'STX'
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-900/50 text-slate-400 hover:text-white'
                            }`}
                    >
                        STX
                    </button>
                    <button
                        onClick={() => updateSetting('displayCurrency', 'USD')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.displayCurrency === 'USD'
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-900/50 text-slate-400 hover:text-white'
                            }`}
                    >
                        USD Estimate
                    </button>
                </div>
            </div>

            {/* Date Format */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Date Format</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => updateSetting('dateFormat', 'relative')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.dateFormat === 'relative'
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-900/50 text-slate-400 hover:text-white'
                            }`}
                    >
                        Relative (2h ago)
                    </button>
                    <button
                        onClick={() => updateSetting('dateFormat', 'absolute')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.dateFormat === 'absolute'
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-900/50 text-slate-400 hover:text-white'
                            }`}
                    >
                        Absolute (Jan 21)
                    </button>
                </div>
            </div>

            {/* View Mode */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white">View Mode</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => updateSetting('viewMode', 'compact')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.viewMode === 'compact'
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-900/50 text-slate-400 hover:text-white'
                            }`}
                    >
                        Compact
                    </button>
                    <button
                        onClick={() => updateSetting('viewMode', 'expanded')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${settings.viewMode === 'expanded'
                                ? 'bg-primary-600 text-white'
                                : 'bg-slate-900/50 text-slate-400 hover:text-white'
                            }`}
                    >
                        Expanded
                    </button>
                </div>
            </div>

            {/* Theme (Display only - already dark) */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-white">Theme</label>
                <div className="px-4 py-3 bg-slate-900/50 rounded-lg">
                    <p className="text-sm text-slate-400">Dark theme (default)</p>
                </div>
            </div>
        </div>
    );
}
