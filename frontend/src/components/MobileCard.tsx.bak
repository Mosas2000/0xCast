import { ReactNode } from 'react';

interface MobileCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
}

export function MobileCard({
  children,
  className = '',
  onClick,
  padding = 'md',
  variant = 'default'
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5 lg:p-6',
    lg: 'p-6 sm:p-8 lg:p-10'
  };

  const variantClasses = {
    default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
    outlined: 'bg-transparent border-2 border-neutral-300 dark:border-neutral-700',
    elevated: 'bg-white dark:bg-neutral-900 shadow-lg'
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`
        ${paddingClasses[padding]}
        ${variantClasses[variant]}
        rounded-xl
        sm:rounded-2xl
        transition-all
        ${onClick ? 'cursor-pointer active:scale-[0.98] hover:shadow-xl' : ''}
        ${className}
      `}
    >
      {children}
    </Component>
  );
}
