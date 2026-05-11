import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface MobileChipProps {
  label: string;
  icon?: ReactNode;
  onDelete?: () => void;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  color?: 'default' | 'primary' | 'success' | 'error';
  className?: string;
}

export function MobileChip({
  label,
  icon,
  onDelete,
  onClick,
  selected = false,
  disabled = false,
  variant = 'filled',
  color = 'default',
  className = ''
}: MobileChipProps) {
  const baseClasses = 'inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all';

  const colorClasses = {
    filled: {
      default: selected 
        ? 'bg-neutral-800 text-white' 
        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100',
      primary: selected 
        ? 'bg-blue-600 text-white' 
        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      success: selected 
        ? 'bg-green-600 text-white' 
        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      error: selected 
        ? 'bg-red-600 text-white' 
        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    },
    outlined: {
      default: selected 
        ? 'border-2 border-neutral-800 text-neutral-900 dark:text-white' 
        : 'border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300',
      primary: selected 
        ? 'border-2 border-blue-600 text-blue-600' 
        : 'border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400',
      success: selected 
        ? 'border-2 border-green-600 text-green-600' 
        : 'border border-green-300 dark:border-green-700 text-green-600 dark:text-green-400',
      error: selected 
        ? 'border-2 border-red-600 text-red-600' 
        : 'border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
    }
  };

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${colorClasses[variant][color]}
        ${onClick ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="flex-shrink-0 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          disabled={disabled}
        >
          <X size={14} />
        </button>
      )}
    </Component>
  );
}
