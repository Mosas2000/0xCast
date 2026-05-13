# Dropdown Accessibility Migration Guide

This guide helps you migrate existing dropdown components to use the new accessible dropdown patterns.

## Quick Start

The easiest way to make a dropdown accessible is to use the `useAccessibleDropdown` hook.

### Before

```tsx
function MyDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        Select Option
      </button>
      {isOpen && (
        <div>
          <button onClick={() => handleSelect('option1')}>
            Option 1
          </button>
        </div>
      )}
    </div>
  );
}
```

### After

```tsx
import { useAccessibleDropdown } from '../hooks/useAccessibleDropdown';

function MyDropdown() {
  const {
    isOpen,
    dropdownRef,
    buttonProps,
    listboxProps,
    optionProps,
  } = useAccessibleDropdown('my-dropdown');
  
  return (
    <div ref={dropdownRef}>
      <button {...buttonProps} aria-label="Select option">
        Select Option
      </button>
      {isOpen && (
        <div {...listboxProps} aria-label="Options">
          <button 
            {...optionProps(false)}
            onClick={() => handleSelect('option1')}
          >
            Option 1
          </button>
        </div>
      )}
    </div>
  );
}
```

## Manual Implementation

If you can't use the hook, follow these steps to add ARIA attributes manually.

### Step 1: Add ARIA Attributes to Button

```tsx
<button
  onClick={() => setIsOpen(!isOpen)}
  aria-label="Select option"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls="my-dropdown-listbox"
>
  Select Option
</button>
```

### Step 2: Add ARIA Attributes to Menu

```tsx
<div
  id="my-dropdown-listbox"
  role="listbox"
  aria-label="Options"
>
  {/* options */}
</div>
```

### Step 3: Add ARIA Attributes to Options

```tsx
<button
  role="option"
  aria-selected={isSelected}
  onClick={() => handleSelect(value)}
>
  Option Label
</button>
```

### Step 4: Add Keyboard Navigation

```tsx
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen]);
```

### Step 5: Add Click Outside Handler

```tsx
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

### Step 6: Add Focus Management

```tsx
const buttonRef = useRef<HTMLButtonElement>(null);

const handleSelect = (value: string) => {
  onChange(value);
  setIsOpen(false);
  buttonRef.current?.focus();
};
```

## Component-Specific Examples

### Select Dropdown

```tsx
import { useAccessibleDropdown } from '../hooks/useAccessibleDropdown';

interface SelectDropdownProps {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export function SelectDropdown({ options, value, onChange, label }: SelectDropdownProps) {
  const {
    isOpen,
    dropdownRef,
    buttonProps,
    listboxProps,
    optionProps,
  } = useAccessibleDropdown('select-dropdown');

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef}>
      <button {...buttonProps} aria-label={label}>
        {selectedOption?.label || 'Select...'}
      </button>
      {isOpen && (
        <div {...listboxProps} aria-label={`${label} options`}>
          {options.map(option => (
            <button
              key={option.value}
              {...optionProps(option.value === value)}
              onClick={() => {
                onChange(option.value);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Menu Dropdown

```tsx
import { useAccessibleDropdown } from '../hooks/useAccessibleDropdown';

interface MenuDropdownProps {
  trigger: React.ReactNode;
  items: Array<{ id: string; label: string; onClick: () => void }>;
}

export function MenuDropdown({ trigger, items }: MenuDropdownProps) {
  const {
    isOpen,
    dropdownRef,
    buttonProps,
    listboxProps,
    optionProps,
  } = useAccessibleDropdown('menu-dropdown');

  return (
    <div ref={dropdownRef}>
      <button {...buttonProps} aria-label="Open menu">
        {trigger}
      </button>
      {isOpen && (
        <div {...listboxProps} aria-label="Menu options">
          {items.map(item => (
            <button
              key={item.id}
              {...optionProps(false)}
              onClick={item.onClick}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Testing Your Changes

After migrating, test your dropdown with:

### Keyboard Navigation
1. Tab to the dropdown button
2. Press Enter or Space to open
3. Press Escape to close
4. Verify focus returns to button

### Screen Reader
1. Use NVDA, JAWS, or VoiceOver
2. Verify button announces "has popup listbox"
3. Verify expanded state is announced
4. Verify options are announced correctly

### Automated Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';

describe('MyDropdown Accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(<MyDropdown />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens on click', () => {
    render(<MyDropdown />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    render(<MyDropdown />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
```

## Common Issues

### Issue: Dropdown doesn't close on Escape

**Solution**: Ensure keyboard event listener is attached to document and checks `isOpen` state.

```tsx
useEffect(() => {
  if (!isOpen) return;
  
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen]);
```

### Issue: Focus not returning to button

**Solution**: Store button ref and focus it after selection.

```tsx
const buttonRef = useRef<HTMLButtonElement>(null);

const handleSelect = (value: string) => {
  onChange(value);
  setIsOpen(false);
  buttonRef.current?.focus();
};
```

### Issue: Screen reader not announcing state

**Solution**: Ensure all ARIA attributes are present and correct.

```tsx
<button
  aria-label="Select option"
  aria-haspopup="listbox"
  aria-expanded={isOpen}
  aria-controls="dropdown-listbox"
>
```

## Checklist

Before marking your dropdown as complete, verify:

- [ ] Button has `aria-haspopup="listbox"`
- [ ] Button has `aria-expanded` that reflects state
- [ ] Button has `aria-controls` pointing to listbox ID
- [ ] Button has descriptive `aria-label`
- [ ] Menu has `role="listbox"`
- [ ] Menu has unique `id`
- [ ] Menu has descriptive `aria-label`
- [ ] Options have `role="option"`
- [ ] Options have `aria-selected` attribute
- [ ] Escape key closes dropdown
- [ ] Click outside closes dropdown
- [ ] Focus returns to button after selection
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Tests cover accessibility features

## Resources

- [useAccessibleDropdown Hook](../src/hooks/useAccessibleDropdown.ts)
- [Example Component](../src/components/examples/AccessibleDropdownExample.tsx)
- [Accessibility Documentation](./DROPDOWN_ACCESSIBILITY.md)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
