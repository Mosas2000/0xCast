# PWA Testing Guide

## Testing Checklist

### Installation
- [ ] Install prompt appears on supported browsers
- [ ] App installs successfully
- [ ] App icon appears on home screen
- [ ] App launches in standalone mode
- [ ] Splash screen displays correctly

### Offline Functionality
- [ ] App works without internet
- [ ] Cached markets display correctly
- [ ] Offline indicator shows when offline
- [ ] Pending transactions queue properly
- [ ] Transactions sync when back online

### Mobile Experience
- [ ] Touch targets are at least 44x44px
- [ ] Pull-to-refresh works
- [ ] Swipe gestures work
- [ ] Bottom navigation visible on mobile
- [ ] Safe area insets respected (notched devices)
- [ ] No horizontal scrolling
- [ ] Text is readable (min 16px on mobile)

### Performance
- [ ] Lighthouse PWA score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3.5s
- [ ] Service worker caches properly

## Testing Tools

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Check:
   - Manifest
   - Service Workers
   - Cache Storage
   - IndexedDB

### Lighthouse
```bash
# Run Lighthouse audit
npx lighthouse https://your-domain.com --view
```

### Manual Testing

**Desktop:**
1. Open in Chrome/Edge
2. Look for install icon in address bar
3. Install and test

**Mobile:**
1. Open in mobile browser
2. Add to Home Screen
3. Launch from home screen
4. Test offline mode (enable Airplane mode)

## Common Issues

### Install Prompt Not Showing
- Check HTTPS is enabled
- Verify manifest.json is valid
- Ensure service worker is registered
- Check browser console for errors

### Offline Mode Not Working
- Verify service worker is active
- Check cache storage in DevTools
- Ensure fetch events are intercepted

### Performance Issues
- Reduce cached assets
- Optimize images
- Use code splitting
- Enable compression

## Browser Support

- Chrome 80+
- Edge 80+
- Safari 14+ (limited)
- Firefox 90+
- Samsung Internet 12+
