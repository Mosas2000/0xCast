import { useEffect, useRef } from 'react';

export interface Tab {
    id: string;
    label: string;
    disabled?: boolean;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (tabId: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
    const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
    const indicatorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const activeTabElement = tabRefs.current[activeTab];
        const indicator = indicatorRef.current;

        if (activeTabElement && indicator) {
            indicator.style.width = `${activeTabElement.offsetWidth}px`;
            indicator.style.left = `${activeTabElement.offsetLeft}px`;
        }
    }, [activeTab]);

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'ArrowLeft' && index > 0) {
            const prevTab = tabs[index - 1];
            if (!prevTab.disabled) onChange(prevTab.id);
        } else if (e.key === 'ArrowRight' && index < tabs.length - 1) {
            const nextTab = tabs[index + 1];
            if (!nextTab.disabled) onChange(nextTab.id);
        }
    };

    return (
        <div className={`relative ${className}`.trim()}>
            <div className="flex space-x-1 border-b border-slate-700 relative">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        ref={(el) => (tabRefs.current[tab.id] = el)}
                        onClick={() => !tab.disabled && onChange(tab.id)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        disabled={tab.disabled}
                        className={`px-4 py-2 font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-primary-400'
                                : tab.disabled
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-slate-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}

                {/* Animated underline */}
                <div
                    ref={indicatorRef}
                    className="absolute bottom-0 h-0.5 bg-primary-400 transition-all duration-200 ease-out"
                />
            </div>
        </div>
    );
}
