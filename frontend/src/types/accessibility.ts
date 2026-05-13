/**
 * Accessibility Types
 * 
 * Type definitions for accessibility-related props and utilities
 */

export interface AriaDropdownButtonProps {
  'aria-haspopup': 'listbox' | 'menu' | 'dialog';
  'aria-expanded': boolean;
  'aria-controls'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export interface AriaListboxProps {
  role: 'listbox';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-multiselectable'?: boolean;
  'aria-required'?: boolean;
  'aria-disabled'?: boolean;
}

export interface AriaOptionProps {
  role: 'option';
  'aria-selected': boolean;
  'aria-disabled'?: boolean;
  'aria-label'?: string;
}

export interface AriaMenuProps {
  role: 'menu';
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-orientation'?: 'horizontal' | 'vertical';
}

export interface AriaMenuItemProps {
  role: 'menuitem';
  'aria-disabled'?: boolean;
  'aria-label'?: string;
}

export interface AriaLiveRegionProps {
  role: 'status' | 'alert' | 'log';
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
}

export interface KeyboardNavigationConfig {
  closeOnEscape?: boolean;
  closeOnClickOutside?: boolean;
  enableArrowKeys?: boolean;
  enableTypeAhead?: boolean;
  enableHomeEnd?: boolean;
}

export interface FocusManagementConfig {
  returnFocusOnClose?: boolean;
  trapFocus?: boolean;
  initialFocus?: 'first' | 'last' | 'selected';
}

export interface AccessibilityOptions {
  keyboard?: KeyboardNavigationConfig;
  focus?: FocusManagementConfig;
  announcements?: boolean;
  highContrast?: boolean;
}

export type AriaRole =
  | 'button'
  | 'listbox'
  | 'option'
  | 'menu'
  | 'menuitem'
  | 'dialog'
  | 'alertdialog'
  | 'status'
  | 'alert'
  | 'navigation'
  | 'main'
  | 'complementary'
  | 'contentinfo';

export type AriaLive = 'polite' | 'assertive' | 'off';

export type AriaOrientation = 'horizontal' | 'vertical';

export interface ScreenReaderAnnouncement {
  message: string;
  priority: AriaLive;
  clearAfter?: number;
}
