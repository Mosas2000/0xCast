# Accessibility Checklist

Use this checklist when implementing or reviewing accessible components.

## Dropdown Components

### ARIA Attributes
- [ ] Button has `aria-haspopup="listbox"`
- [ ] Button has `aria-expanded` reflecting state
- [ ] Button has `aria-controls` pointing to listbox ID
- [ ] Button has descriptive `aria-label` or visible text
- [ ] Listbox has `role="listbox"`
- [ ] Listbox has unique `id`
- [ ] Listbox has descriptive `aria-label`
- [ ] Options have `role="option"`
- [ ] Options have `aria-selected` attribute

### Keyboard Navigation
- [ ] Escape key closes dropdown
- [ ] Click outside closes dropdown
- [ ] Focus returns to button after selection
- [ ] Tab key moves focus logically

### Focus Management
- [ ] Focus indicators are visible
- [ ] Focus order is logical
- [ ] No keyboard traps
- [ ] Focus is managed on open/close

### Screen Reader
- [ ] Button state is announced
- [ ] Dropdown opening is announced
- [ ] Options are announced correctly
- [ ] Selection changes are announced

## General Components

### Semantic HTML
- [ ] Use semantic HTML elements
- [ ] Headings are in logical order
- [ ] Lists use proper markup
- [ ] Forms use proper labels

### Images
- [ ] All images have alt text
- [ ] Decorative images have empty alt
- [ ] Complex images have descriptions

### Forms
- [ ] All inputs have labels
- [ ] Error messages are associated
- [ ] Required fields are indicated
- [ ] Form validation is accessible

### Color and Contrast
- [ ] Text meets contrast requirements (4.5:1)
- [ ] Large text meets contrast (3:1)
- [ ] Color is not the only indicator
- [ ] Focus indicators are visible

### Keyboard
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] No keyboard traps
- [ ] Shortcuts don't conflict

## Testing

### Manual Testing
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Test with browser zoom (200%)
- [ ] Test with high contrast mode

### Automated Testing
- [ ] Run accessibility tests
- [ ] Check for ARIA violations
- [ ] Validate HTML
- [ ] Test with axe DevTools

### Browser Testing
- [ ] Chrome + NVDA
- [ ] Firefox + NVDA
- [ ] Safari + VoiceOver
- [ ] Edge + JAWS

## WCAG Compliance

### Level A (Required)
- [ ] 1.1.1 Non-text Content
- [ ] 1.3.1 Info and Relationships
- [ ] 2.1.1 Keyboard
- [ ] 2.4.1 Bypass Blocks
- [ ] 3.3.2 Labels or Instructions
- [ ] 4.1.2 Name, Role, Value

### Level AA (Recommended)
- [ ] 1.4.3 Contrast (Minimum)
- [ ] 1.4.5 Images of Text
- [ ] 2.4.6 Headings and Labels
- [ ] 2.4.7 Focus Visible
- [ ] 3.2.4 Consistent Identification

## Documentation

- [ ] Component has accessibility documentation
- [ ] ARIA patterns are documented
- [ ] Keyboard shortcuts are documented
- [ ] Screen reader behavior is documented
