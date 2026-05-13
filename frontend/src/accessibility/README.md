# Accessibility Implementation

This directory contains accessibility utilities, hooks, and components for building WCAG-compliant interfaces.

## Overview

The accessibility implementation provides:

- **ARIA Attributes**: Proper semantic markup for assistive technologies
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus Management**: Logical focus order and focus trapping
- **Screen Reader Support**: Announcements and live regions
- **Visual Indicators**: Clear focus states and high contrast support

## Quick Start

### Using the Accessible Dropdown Hook

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
        Select
      </button>
      {isOpen && (
        <div {...listboxProps} aria-label="Options">
          <button {...optionProps(true)}>Option 1</button>
        </div>
      )}
    </div>
  );
}
```

## Available Utilities

### Hooks

- **`useAccessibleDropdown`** - Complete dropdown accessibility
- **`useKeyboardNavigation`** - Keyboard event handling
- **`useFocusTrap`** - Focus trapping for modals

### Components

- **`AccessibilityAnnouncer`** - Screen reader announcements
- **`SkipToMain`** - Skip navigation link

### Utilities

- **`announceToScreenReader`** - Programmatic announcements
- **`getFocusableElements`** - Find focusable elements
- **`validateAriaAttributes`** - ARIA validation
- **`trapFocus`** - Focus trap implementation

### Constants

- **`ARIA_ROLES`** - Standard ARIA roles
- **`KEYBOARD_KEYS`** - Keyboard key constants
- **`WCAG_CONTRAST_RATIOS`** - Contrast requirements
- **`ACCESSIBILITY_LABELS`** - Standard labels

## Documentation

- [Dropdown Accessibility Guide](../../docs/DROPDOWN_ACCESSIBILITY.md)
- [Migration Guide](../../docs/DROPDOWN_MIGRATION_GUIDE.md)
- [Accessibility Checklist](../../docs/ACCESSIBILITY_CHECKLIST.md)

## Testing

Run accessibility tests:

```bash
npm test -- --grep "Accessibility"
```

## WCAG Compliance

All implementations meet WCAG 2.1 Level A requirements:

- ✅ 4.1.2 Name, Role, Value
- ✅ 2.1.1 Keyboard
- ✅ 2.4.3 Focus Order
- ✅ 2.4.7 Focus Visible

## Browser Support

Tested with:

- Chrome + NVDA
- Firefox + NVDA
- Safari + VoiceOver
- Edge + JAWS

## Contributing

When adding new accessible components:

1. Use semantic HTML
2. Add proper ARIA attributes
3. Implement keyboard navigation
4. Add focus management
5. Write accessibility tests
6. Update documentation

## Resources

- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
