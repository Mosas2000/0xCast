import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAccessibleDropdownOptions {
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
}

interface UseAccessibleDropdownReturn {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  buttonRef: React.RefObject<HTMLButtonElement>;
  listboxId: string;
  buttonProps: {
    ref: React.RefObject<HTMLButtonElement>;
    'aria-haspopup': 'listbox';
    'aria-expanded': boolean;
    'aria-controls': string;
    onClick: () => void;
  };
  listboxProps: {
    id: string;
    role: 'listbox';
  };
  optionProps: (isSelected: boolean) => {
    role: 'option';
    'aria-selected': boolean;
  };
}

export function useAccessibleDropdown(
  id: string,
  options: UseAccessibleDropdownOptions = {}
): UseAccessibleDropdownReturn {
  const {
    onClose,
    closeOnEscape = true,
    closeOnClickOutside = true,
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxId = `${id}-listbox`;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    onClose?.();
    buttonRef.current?.focus();
  }, [onClose]);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        closeDropdown();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnClickOutside &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeOnEscape, closeOnClickOutside, closeDropdown]);

  const buttonProps = {
    ref: buttonRef,
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': isOpen,
    'aria-controls': listboxId,
    onClick: toggleOpen,
  };

  const listboxProps = {
    id: listboxId,
    role: 'listbox' as const,
  };

  const optionProps = (isSelected: boolean) => ({
    role: 'option' as const,
    'aria-selected': isSelected,
  });

  return {
    isOpen,
    setIsOpen,
    toggleOpen,
    dropdownRef,
    buttonRef,
    listboxId,
    buttonProps,
    listboxProps,
    optionProps,
  };
}
