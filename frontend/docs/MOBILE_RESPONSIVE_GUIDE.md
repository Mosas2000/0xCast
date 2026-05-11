# Mobile Responsive Design Guide

## Overview

This guide documents the mobile-responsive design improvements implemented for the 0xCast prediction market platform. The implementation focuses on providing an optimal user experience across all device sizes, with special attention to touch interactions, performance, and accessibility.

## Components

### Navigation Components

#### MobileNavigation
- Hamburger menu for small screens
- Bottom navigation bar with quick access
- Active state indicators
- Touch-friendly tap targets (44px minimum)

#### MobileBottomNav
- Fixed bottom navigation
- Icon-based navigation with labels
- Elevated create button
- Safe area support for notched devices

#### MobileHeader
- Fixed top header with backdrop blur
- Notification and profile quick access
- Responsive menu toggle
- Safe area insets support

### Form Components

#### MobileFormInput
- Touch-optimized input fields (44px min height)
- 16px font size to prevent iOS zoom
- Icon support
- Error and helper text display
- Accessible labels

#### MobileTextarea
- Auto-resizing textarea
- Character count display
- Touch-friendly sizing
- Error handling

#### MobileSelect
- Native select styling
- Custom dropdown arrow
- Touch-optimized height
- Accessible options

### Layout Components

#### MobileCard
- Responsive padding (sm, md, lg)
- Multiple variants (default, outlined, elevated)
- Touch feedback on interactive cards
- Smooth transitions

#### MobileGrid
- Responsive column configuration
- Breakpoint-based layouts
- Flexible gap sizing
- Auto-fit grid items

#### MobileTabs
- Horizontal scrolling tabs
- Active tab indicator
- Icon support
- Touch-friendly tap targets

#### MobileAccordion
- Expandable/collapsible sections
- Single or multiple open items
- Smooth animations
- Icon support

### Interactive Components

#### SwipeableCard
- Left/right swipe gestures
- Configurable threshold
- Smooth animations
- Touch feedback

#### MobileBottomSheet
- Slide-up modal from bottom
- Multiple snap points
- Backdrop blur
- Drag handle indicator

#### MobileModal
- Full-screen on mobile
- Centered on desktop
- Keyboard navigation (ESC to close)
- Backdrop click to close

#### PullToRefresh
- Pull-down to refresh gesture
- Visual feedback indicator
- Configurable threshold
- Loading state

### Display Components

#### MobileResponsiveChart
- Canvas-based rendering
- Auto-scaling to container
- Touch-optimized
- Gradient fills
- Grid lines

#### LazyImage
- Intersection Observer API
- Placeholder support
- Fade-in animation
- Performance optimized

#### MobileToast
- Auto-dismiss notifications
- Multiple types (success, error, warning, info)
- Configurable position (top/bottom)
- Swipe to dismiss

#### MobileSearch
- Auto-focus support
- Clear button
- Focus state styling
- Touch-optimized

### Utility Components

#### MobileButton
- Multiple variants and sizes
- Loading state
- Icon support (left/right)
- Full-width option
- Touch-friendly (44px min)

## Hooks

### useMobileDetect
Detects device type and capabilities:
- `isMobile`: Screen width < 768px
- `isTablet`: Screen width 768-1024px
- `isDesktop`: Screen width >= 1024px
- `isIOS`: iOS device detection
- `isAndroid`: Android device detection
- `isTouchDevice`: Touch capability detection
- `screenSize`: Current breakpoint (xs, sm, md, lg, xl, 2xl)

### useTouchGestures
Handles touch gestures:
- Swipe left/right/up/down
- Pinch to zoom
- Configurable threshold
- Event callbacks

### useViewport
Tracks viewport dimensions:
- Current width and height
- Responsive breakpoint detection
- Real-time updates on resize

## Styles

### mobile.css
Comprehensive mobile-specific styles:
- Touch-friendly button sizes
- Mobile-optimized form inputs
- Safe area insets for notched devices
- Responsive spacing utilities
- Scrollable containers
- Mobile grid layouts
- Touch-friendly tap targets
- Mobile-optimized modals
- Swipeable elements
- Mobile-optimized tables
- Bottom sheet styles
- Pull-to-refresh indicators
- Landscape mode adjustments
- Reduced motion support

## Performance Utilities

### mobilePerformance.ts
Performance optimization utilities:
- `debounce`: Debounce function calls
- `throttle`: Throttle function calls
- `lazyLoad`: Lazy load with requestIdleCallback
- `prefetchImage`: Preload images
- `isReducedMotion`: Check motion preferences
- `getConnectionSpeed`: Detect connection quality
- `shouldReduceData`: Check data saver mode
- `optimizeForLowEnd`: Detect low-end devices
- `measurePerformance`: Performance measurement
- `enableHardwareAcceleration`: GPU acceleration
- `optimizeScrolling`: Smooth scrolling

## Best Practices

### Touch Targets
- Minimum 44x44px tap targets
- Adequate spacing between interactive elements
- Visual feedback on touch (active states)

### Typography
- 16px minimum font size for inputs (prevents iOS zoom)
- Readable line heights (1.5-1.6)
- Appropriate font weights for mobile screens

### Performance
- Lazy load images and heavy components
- Use hardware acceleration for animations
- Debounce/throttle scroll and resize handlers
- Optimize for low-end devices
- Respect data saver mode

### Gestures
- Support common mobile gestures (swipe, pinch)
- Provide visual feedback for gestures
- Don't override native browser gestures

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Respect reduced motion preferences

### Layout
- Mobile-first responsive design
- Flexible grid systems
- Appropriate breakpoints (640px, 768px, 1024px, 1280px, 1536px)
- Safe area insets for notched devices

### Forms
- Large, touch-friendly inputs
- Clear error messages
- Inline validation
- Appropriate input types (tel, email, number)
- Prevent zoom on focus

### Navigation
- Bottom navigation for primary actions
- Hamburger menu for secondary navigation
- Breadcrumbs for deep navigation
- Back button support

## Testing Checklist

### Device Testing
- [ ] iPhone (various models)
- [ ] iPad
- [ ] Android phones (various sizes)
- [ ] Android tablets
- [ ] Different screen orientations

### Browser Testing
- [ ] Safari (iOS)
- [ ] Chrome (Android)
- [ ] Firefox (mobile)
- [ ] Samsung Internet

### Performance Testing
- [ ] Lighthouse mobile score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s
- [ ] Smooth 60fps animations
- [ ] No layout shifts

### Interaction Testing
- [ ] All touch targets >= 44px
- [ ] Swipe gestures work smoothly
- [ ] Forms are easy to fill
- [ ] Navigation is intuitive
- [ ] Modals/sheets work correctly

### Accessibility Testing
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Reduced motion respected

## Implementation Examples

### Using Mobile Components

```tsx
import { MobileButton } from '@/components/MobileButton';
import { MobileCard } from '@/components/MobileCard';
import { MobileFormInput } from '@/components/MobileFormInput';

function MyComponent() {
  return (
    <MobileCard padding="md">
      <MobileFormInput
        label="Email"
        type="email"
        placeholder="Enter your email"
      />
      <MobileButton variant="primary" fullWidth>
        Submit
      </MobileButton>
    </MobileCard>
  );
}
```

### Using Mobile Hooks

```tsx
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { useTouchGestures } from '@/hooks/useTouchGestures';

function MyComponent() {
  const { isMobile, isIOS } = useMobileDetect();
  
  const ref = useTouchGestures({
    onSwipeLeft: () => console.log('Swiped left'),
    onSwipeRight: () => console.log('Swiped right'),
  });

  return (
    <div ref={ref}>
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </div>
  );
}
```

### Using Performance Utilities

```tsx
import { mobilePerformance } from '@/utils/mobilePerformance';

const handleScroll = mobilePerformance.throttle(() => {
  console.log('Scrolling...');
}, 100);

const handleSearch = mobilePerformance.debounce((query: string) => {
  console.log('Searching:', query);
}, 300);
```

## Future Improvements

- [ ] Add haptic feedback for iOS
- [ ] Implement progressive web app (PWA) features
- [ ] Add offline support
- [ ] Implement app-like transitions
- [ ] Add gesture-based navigation
- [ ] Optimize for foldable devices
- [ ] Add dark mode optimizations
- [ ] Implement adaptive loading based on connection speed
