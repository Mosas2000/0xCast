# Dropdown Accessibility Guide

This document outlines the accessibility improvements made to dropdown components in the application to ensure WCAG 2.1 Level A compliance.

## Overview

All dropdown components now include proper ARIA attributes and keyboard navigation support to ensure they are accessible to screen reader users and keyboard-only users.

## WCAG Compliance

The improvements address the following WCAG 2.1 criteria:

- **4.1.2 Name, Role, Value (Level A)**: All dropdown components now have proper roles and ARIA attributes
- **2.1.1 Keyboard (Level A)**: All dropdowns can be operated using keyboard only
- **2.4.3 Focus Order (Level A)**: Focus management ensures logical navigation

## Implemented Features

### ARIA Attributes

All dropdown buttons include:
- `aria-haspopup="listbox"` - Indicates the button opens a listbox
- `aria-expanded` - Indicates whether the dropdown is open or closed
- `aria-label` - Provides accessible name for the button

All dropdown menus include:
- `role="listbox"` - Identifies the dropdown menu as a listbox
- `aria-label` - Provides accessible name for the menu

All dropdown options include:
- `role="option"` - Identifies each item as an option
- `aria-selected` - Indicates the currently selected option

### Keyboard Navigation

All dropdowns support:
- **Escape key**: Closes the dropdown
- **Click outside**: Closes the dropdown
- **Focus management**: Returns focus to trigger button after selection

## Affected Components

### LanguageSwitcher

Location: `frontend/src/components/LanguageSwitcher.tsx`

Features:
- Language selection dropdown with ARIA attributes
- Keyboard navigation support
- Focus management after language change
- Screen reader announcements for selected language

### NetworkSelector

Location: `frontend/src/components/NetworkSelector.tsx`

Features:
- Network selection dropdown with ARIA attributes
- Keyboard navigation support
- Focus management after network change
- Screen reader announcements for selected network

### MarketFilter

Location: `frontend/src/components/MarketFilter.tsx`

Features:
- Category and sort dropdowns with ARIA attributes
- Keyboard navigation support
- Multiple dropdown management
- Screen reader announcements for filter changes

## Testing

Accessibility tests have been added for all dropdown components:

- `frontend/src/components/__tests__/LanguageSwitcher.accessibility.test.tsx`
- `frontend/src/components/__tests__/NetworkSelector.accessibility.test.tsx`

Run tests with:
```bash
npm test -- --grep "Accessibility"
```

## Screen Reader Testing

The dropdowns have been designed to work with popular screen readers:

- **NVDA** (Windows)
- **JAWS** (Windows)
- **VoiceOver** (macOS/iOS)
- **TalkBack** (Android)

### Expected Announcements

When a user focuses on a dropdown button:
- "Select language, button, collapsed, has popup listbox"
- "Select network, button, collapsed, has popup listbox"

When a user opens a dropdown:
- "Language options, listbox"
- "Network options, listbox"

When a user navigates options:
- "English, option, selected"
- "Mainnet, option, selected"

## Best Practices

When creating new dropdown components:

1. Always include `aria-haspopup="listbox"` on the trigger button
2. Always include `aria-expanded` that reflects the open/closed state
3. Always include `role="listbox"` on the dropdown menu
4. Always include `role="option"` on each menu item
5. Always include `aria-selected` on options to indicate selection
6. Always implement Escape key to close the dropdown
7. Always implement click-outside to close the dropdown
8. Always return focus to the trigger button after selection

## Code Example

```tsx
export function AccessibleDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const handleSelect = (value: string) => {
    // Handle selection
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select option"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        Select
      </button>

      {isOpen && (
        <div role="listbox" aria-label="Options">
          <button
            role="option"
            aria-selected={true}
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

## Resources

- [ARIA Authoring Practices Guide - Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN ARIA: listbox role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role)

## Future Improvements

Potential enhancements for future iterations:

- Arrow key navigation between options
- Type-ahead search in dropdowns
- Home/End key support
- Page Up/Page Down for long lists
- Live region announcements for dynamic updates
