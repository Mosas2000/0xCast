import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface MobileSearchProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  showClearButton?: boolean;
}

export function MobileSearch({
  placeholder = 'Search...',
  value = '',
  onChange,
  onFocus,
  onBlur,
  autoFocus = false,
  showClearButton = true
}: MobileSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div
        className={`
          flex items-center gap-3 px-4 py-3
          bg-neutral-100 dark:bg-neutral-900
          border-2 transition-all rounded-lg
          ${isFocused 
            ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
            : 'border-transparent'
          }
        `}
      >
        <Search
          size={20}
          className={`flex-shrink-0 transition-colors ${
            isFocused 
              ? 'text-blue-500' 
              : 'text-neutral-500'
          }`}
        />

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          className="
            flex-1 bg-transparent border-none outline-none
            text-base text-neutral-900 dark:text-white
            placeholder-neutral-500
          "
        />

        {showClearButton && value && (
          <button
            onClick={handleClear}
            className="flex-shrink-0 p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Clear search"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        )}
      </div>
    </div>
  );
}
