import { useState } from 'react';
import { Modal } from './Modal';
import { NotificationPreferences } from './NotificationPreferences';
import { DisplayPreferences } from './DisplayPreferences';
import { AccountSettings } from './AccountSettings';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'preferences' | 'notifications' | 'account';

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('preferences');

    const tabs: { id: Tab; label: string }[] = [
        { id: 'preferences', label: 'Preferences' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'account', label: 'Account' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="space-y-6">
                {/* Tabs */}
                <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-lg">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-primary-600 text-white'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[300px]">
                    {activeTab === 'preferences' && <DisplayPreferences />}
                    {activeTab === 'notifications' && <NotificationPreferences />}
                    {activeTab === 'account' && <AccountSettings />}
                </div>
            </div>
        </Modal>
    );
}
