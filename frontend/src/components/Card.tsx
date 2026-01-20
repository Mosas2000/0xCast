import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
    const baseClasses = 'bg-slate-800 rounded-lg p-6 shadow-lg';
    const hoverClasses = onClick ? 'cursor-pointer hover:bg-slate-750 hover:shadow-xl transition-all duration-200' : '';
    const combinedClasses = `${baseClasses} ${hoverClasses} ${className}`.trim();

    return (
        <div className={combinedClasses} onClick={onClick}>
            {children}
        </div>
    );
}
