import { ReactNode } from 'react';

interface MobileNavItem {
    id: string;
    label: string;
    icon: ReactNode;
    onClick: () => void;
}

interface MobileNavProps {
    items: MobileNavItem[];
    activeId: string;
    className?: string;
}

export function MobileNav({ items, activeId, className = '' }: MobileNavProps) {
    return (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50 ${className}`.trim()}>
            <div className="flex items-center justify-around">
                {items.map((item) => {
                    const isActive = item.id === activeId;

                    return (
                        <button
                            key={item.id}
                            onClick={item.onClick}
                            className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${isActive
                                    ? 'text-primary-400'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <div className="w-6 h-6 mb-1">{item.icon}</div>
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
