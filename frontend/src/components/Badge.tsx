import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'info' | 'danger';

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-green-500/20 text-green-400 border-green-500/50',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    danger: 'bg-red-500/20 text-red-400 border-red-500/50',
};

export function Badge({ children, variant = 'info', className = '' }: BadgeProps) {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium border';
    const variantClass = variantClasses[variant];
    const combinedClasses = `${baseClasses} ${variantClass} ${className}`.trim();

    return <span className={combinedClasses}>{children}</span>;
}
