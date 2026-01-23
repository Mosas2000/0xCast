import { ReactNode, useEffect } from 'react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
}

/**
 * Collapsible sidebar component
 * Slides in from left with overlay backdrop
 * Closes on backdrop click or escape key
 */
export function Sidebar({ isOpen, onClose, children, className = '' }: SidebarProps) {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <>
            {/* Backdrop Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-80 max-w-[85vw]
                    bg-slate-900 border-r border-slate-700
                    z-50
                    overflow-y-auto
                    shadow-2xl
                    animate-slide-in-right
                    ${className}
                `.trim()}
                role="dialog"
                aria-modal="true"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="
                        absolute top-4 right-4
                        p-2 rounded-lg
                        text-slate-400 hover:text-white hover:bg-slate-800
                        transition-colors
                    "
                    aria-label="Close sidebar"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Content */}
                <div className="p-6 pt-16">
                    {children}
                </div>
            </aside>
        </>
    );
}
