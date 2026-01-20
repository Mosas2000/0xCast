import { ReactNode } from 'react';

interface EmptyStateProps {
    message: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ message, icon, action, className = '' }: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`.trim()}>
            {icon && (
                <div className="mb-4 text-slate-600">
                    {icon}
                </div>
            )}

            <p className="text-lg text-slate-400 mb-4">{message}</p>

            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
