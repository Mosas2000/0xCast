import React, { ReactNode } from 'react';

interface A11yWrapperProps {
    children: ReactNode;
    label: string;
    role?: string;
    onKeyDown?: (e: React.KeyboardEvent) => void;
}

/**
 * Enhanced accessibility wrapper with ARIA support and keyboard handlers.
 */
export const A11yWrapper: React.FC<A11yWrapperProps> = ({
    children,
    label,
    role = 'region',
    onKeyDown
}) => {
    return (
        <div
            aria-label={label}
            role={role}
            onKeyDown={onKeyDown}
            tabIndex={onKeyDown ? 0 : undefined}
            className="outline-none focus:ring-2 focus:ring-primary-500 rounded-lg transition-shadow"
        >
            {children}
        </div>
    );
};
