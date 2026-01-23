import { ReactNode } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

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
    const { isMobile } = useIsMobile();

    // Only render on mobile devices
    if (!isMobile) {
        return null;
    }

    return (
        <nav 
            className={`
                fixed bottom-0 left-0 right-0 
                bg-slate-900/95 backdrop-blur-sm 
                border-t border-slate-700/50 
                z-50 shadow-xl
                animate-slide-in
                ${className}
            `.trim()}
        >
            <div className="flex items-center justify-around max-w-lg mx-auto">
                {items.map((item) => {
                    const isActive = item.id === activeId;

                    return (
                        <button
                            key={item.id}
                            onClick={item.onClick}
                            className={`
                                flex-1 flex flex-col items-center justify-center 
                                py-4 px-2
                                transition-all duration-200
                                min-h-[60px]
                                ${isActive
                                    ? 'text-primary-400 scale-110'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }
                            `.trim()}
                        >
                            <div className="w-6 h-6 mb-1.5 relative">
                                {item.icon}
                                {isActive && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                                )}
                            </div>
                            <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
