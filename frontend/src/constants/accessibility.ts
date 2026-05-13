/**
 * Accessibility Constants
 * 
 * Centralized constants for accessibility features
 */

export const ARIA_ROLES = {
  BUTTON: 'button',
  LISTBOX: 'listbox',
  OPTION: 'option',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  CONTENTINFO: 'contentinfo',
} as const;

export const ARIA_LIVE = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off',
} as const;

export const KEYBOARD_KEYS = {
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

export const WCAG_CONTRAST_RATIOS = {
  NORMAL_TEXT_AA: 4.5,
  NORMAL_TEXT_AAA: 7,
  LARGE_TEXT_AA: 3,
  LARGE_TEXT_AAA: 4.5,
  UI_COMPONENTS: 3,
} as const;

export const FOCUS_VISIBLE_STYLES = {
  OUTLINE_WIDTH: '2px',
  OUTLINE_COLOR: '#3B82F6',
  OUTLINE_OFFSET: '2px',
  OUTLINE_STYLE: 'solid',
} as const;

export const SCREEN_READER_CLASSES = {
  ONLY: 'sr-only',
  FOCUSABLE: 'sr-only-focusable',
} as const;

export const ANNOUNCEMENT_DELAYS = {
  SHORT: 500,
  MEDIUM: 1000,
  LONG: 2000,
} as const;

export const ACCESSIBILITY_LABELS = {
  CLOSE: 'Close',
  OPEN: 'Open',
  EXPAND: 'Expand',
  COLLAPSE: 'Collapse',
  SELECT: 'Select',
  SELECTED: 'Selected',
  LOADING: 'Loading',
  ERROR: 'Error',
  SUCCESS: 'Success',
  WARNING: 'Warning',
  INFO: 'Information',
} as const;
