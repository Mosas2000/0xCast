import { InputHTMLAttributes, forwardRef } from 'react';

interface MobileFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const MobileFormInput = forwardRef<HTMLInputElement, MobileFormInputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full
              min-h-[44px]
              px-4
              ${icon ? 'pl-12' : ''}
              py-3
              text-base
              bg-white dark:bg-neutral-900
              border
              ${error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-700'}
              rounded-lg
              text-neutral-900 dark:text-white
              placeholder-neutral-500
              focus:outline-none
              focus:ring-2
              ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
              focus:border-transparent
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
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

MobileFormInput.displayName = 'MobileFormInput';
