import { SelectHTMLAttributes, forwardRef } from 'react';

interface MobileSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
}

export const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(
  ({ label, error, helperText, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full
              min-h-[44px]
              px-4
              py-3
              pr-10
              text-base
              bg-white dark:bg-neutral-900
              border
              ${error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
              rounded-lg
              text-neutral-900 dark:text-white
              focus:outline-none
              focus:ring-2
              ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
              focus:border-transparent
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
              appearance-none
              cursor-pointer
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  }
);

MobileSelect.displayName = 'MobileSelect';
