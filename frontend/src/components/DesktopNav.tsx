import { useState, ReactNode } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface DesktopNavItem {
    id: string;
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    href?: string;
}

interface DesktopNavProps {
    items: DesktopNavItem[];
    activeId: string;
    userMenu?: ReactNode;
    className?: string;
}

/**
 * Desktop-only navigation component
 * Horizontal menu layout with optional dropdown for user menu
 * Only renders on desktop breakpoint (>= 1024px)
 */
export function DesktopNav({ items, activeId, userMenu, className = '' }: DesktopNavProps) {
    const { isDesktop } = useIsMobile();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Only render on desktop
    if (!isDesktop) {
        return null;
    }

    return (
        <nav className={`hidden lg:flex items-center gap-1 ${className}`.trim()}>
            {/* Navigation Items */}
            <div className="flex items-center gap-1">
                {items.map((item) => {
                    const isActive = item.id === activeId;

                    if (item.href) {
                        return (
                            <a
                                key={item.id}
                                href={item.href}
                                className={`
                                    px-4 py-2 rounded-lg
                                    flex items-center gap-2
                                    font-medium text-sm
                                    transition-all duration-200
                                    ${isActive
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                    }
                                `.trim()}
                            >
                                {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                                {item.label}
                            </a>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={item.onClick}
                            className={`
                                px-4 py-2 rounded-lg
                                flex items-center gap-2
                                font-medium text-sm
                                transition-all duration-200
                                ${isActive
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                }
                            `.trim()}
                        >
                            {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                            {item.label}
                        </button>
                    );
                })}
            </div>

            {/* User Menu Dropdown */}
            {userMenu && (
                <div className="relative ml-4">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="
                            p-2 rounded-lg
                            text-slate-300 hover:text-white hover:bg-slate-800
                            transition-colors
                        "
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsUserMenuOpen(false)}
                            />

                            {/* Menu */}
                            <div className="
                                absolute right-0 top-full mt-2 w-56
                                bg-slate-800 rounded-lg shadow-xl border border-slate-700
                                z-50
                                animate-scale-up
                            ">
                                {userMenu}
                            </div>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
