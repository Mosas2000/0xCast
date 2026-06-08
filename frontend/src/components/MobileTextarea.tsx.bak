import { TextareaHTMLAttributes, forwardRef } from 'react';

interface MobileTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  characterCount?: boolean;
  maxLength?: number;
}

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ label, error, helperText, characterCount, maxLength, className = '', value, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {label}
            </label>
            {characterCount && maxLength && (
              <span className={`text-xs ${
                currentLength > maxLength 
                  ? 'text-red-500' 
                  : 'text-neutral-500'
              }`}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          className={`
            w-full
            min-h-[100px]
            px-4
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
            resize-y
            ${className}
          `}
          {...props}
        />
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

MobileTextarea.displayName = 'MobileTextarea';
