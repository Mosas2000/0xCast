# ARIA Labels for Icon-Only Buttons

## Overview

This document outlines the accessibility improvements made to icon-only buttons throughout the application. All icon-only buttons now include descriptive `aria-label` attributes to ensure screen reader users can understand their purpose.

## WCAG Compliance

These changes address WCAG 2.1 Level A compliance, specifically:
- **1.1.1 Non-text Content**: All non-text content has a text alternative that serves the equivalent purpose
- **4.1.2 Name, Role, Value**: User interface components have names that can be programmatically determined

## Components Updated

### ShareModal.tsx
- Twitter share button: `aria-label="Share on Twitter"`
- Discord share button: `aria-label="Share on Discord"`
- Telegram share button: `aria-label="Share on Telegram"`
- Reddit share button: `aria-label="Share on Reddit"`

### MobileBottomSheet.tsx
- Snap point buttons: `aria-label="Snap to position {n}"` with `aria-pressed` state
- Close button: Already had proper `aria-label="Close"`

### DrawingToolsPanel.tsx
- Clear all button: `aria-label="Clear all drawings"`
- Remove drawing button: `aria-label="Remove {type} drawing"`
- Stop drawing button: `aria-label="Stop drawing"`
- Undo button: `aria-label="Undo last action"`
- Redo button: `aria-label="Redo last action"`

### NotificationCenter.tsx
- Close button: `aria-label="Close notifications"`
- Filter buttons: 
  - All: `aria-label="Show all notifications"` with `aria-pressed`
  - Unread: `aria-label="Show unread notifications"` with `aria-pressed`
  - Read: `aria-label="Show read notifications"` with `aria-pressed`

### CreateProposalModal.tsx
- Close button: `aria-label="Close modal"`

### PoolPositionRow.tsx
- Add liquidity button: `aria-label="Add liquidity to pool"`
- Remove liquidity button: `aria-label="Remove liquidity from pool"`

## Best Practices

### When to Use aria-label

Use `aria-label` when:
1. A button contains only an icon (no visible text)
2. A button contains only a symbol (×, +, −, etc.)
3. The visible text is not descriptive enough

### When to Use aria-pressed

Use `aria-pressed` for toggle buttons that have an on/off state:
```tsx
<button
  aria-label="Show unread notifications"
  aria-pressed={filterStatus === 'unread'}
>
  Unread
</button>
```

### When to Use aria-hidden

Use `aria-hidden="true"` on decorative icons within buttons that have text labels:
```tsx
<button aria-label="Share on Twitter">
  <svg aria-hidden="true">...</svg>
  Twitter
</button>
```

## Testing

### Manual Testing
1. Use a screen reader (NVDA, JAWS, VoiceOver) to navigate the application
2. Tab through all interactive elements
3. Verify that each button announces its purpose clearly

### Automated Testing
Run accessibility audits using:
- axe DevTools
- Lighthouse accessibility audit
- WAVE browser extension

## Future Improvements

1. Add keyboard shortcuts for common actions
2. Implement focus management for modals
3. Add live regions for dynamic content updates
4. Ensure all interactive elements have visible focus indicators
