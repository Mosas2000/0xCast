import { useAccessibleDropdown } from '../../hooks/useAccessibleDropdown';

interface Option {
  value: string;
  label: string;
}

interface AccessibleDropdownExampleProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function AccessibleDropdownExample({
  options,
  value,
  onChange,
  label,
}: AccessibleDropdownExampleProps) {
  const {
    isOpen,
    dropdownRef,
    buttonProps,
    listboxProps,
    optionProps,
  } = useAccessibleDropdown('example-dropdown', {
    onClose: () => {
      console.log('Dropdown closed');
    },
  });

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        {...buttonProps}
        aria-label={label}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {selectedOption.label}
        </span>
        <svg
          className={`w-4 h-4 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          {...listboxProps}
          aria-label={`${label} options`}
          className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg z-50"
        >
          <div className="py-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  {...optionProps(isSelected)}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
