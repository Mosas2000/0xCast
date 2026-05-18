# React.memo Migration Checklist

## Overview

This checklist guides developers through the process of adding React.memo optimization to list item components.

## Pre-Migration Assessment

### Component Analysis

- [ ] Component is rendered in a list or map
- [ ] Component receives props that don't change frequently
- [ ] Component is pure (same props produce same output)
- [ ] Component has no side effects in render
- [ ] Component doesn't use children prop extensively
- [ ] Parent component re-renders frequently
- [ ] Performance profiling shows unnecessary re-renders

### Performance Baseline

- [ ] Measure current render time
- [ ] Count re-renders in typical usage
- [ ] Document current FPS during scrolling
- [ ] Note CPU usage during updates
- [ ] Record memory usage

## Migration Steps

### Step 1: Import React.memo

```tsx
// Before
import React from 'react';

// After
import React, { memo } from 'react';
```

- [ ] Add memo to React imports

### Step 2: Rename Component

```tsx
// Before
export function MyComponent({ data }: Props) {
  return <div>{data.name}</div>;
}

// After
const MyComponentBase = ({ data }: Props) => {
  return <div>{data.name}</div>;
};
```

- [ ] Rename component to ComponentBase
- [ ] Convert to arrow function (optional but recommended)
- [ ] Keep all logic unchanged

### Step 3: Wrap with memo

```tsx
// Add at the end
export const MyComponent = memo(MyComponentBase);
```

- [ ] Wrap component with memo
- [ ] Export memoized version
- [ ] Verify export name matches original

### Step 4: Verify Props Stability

Check all props passed to the component:

#### Primitive Props (Stable)
```tsx
<MyComponent id={1} name="test" active={true} />
```
- [ ] All primitive props are stable

#### Object Props (May Need useMemo)
```tsx
// Bad
<MyComponent data={{ id: 1, name: 'test' }} />

// Good
const data = useMemo(() => ({ id: 1, name: 'test' }), []);
<MyComponent data={data} />
```
- [ ] Object props are memoized with useMemo
- [ ] Dependencies are correct

#### Array Props (May Need useMemo)
```tsx
// Bad
<MyComponent items={[1, 2, 3]} />

// Good
const items = useMemo(() => [1, 2, 3], []);
<MyComponent items={items} />
```
- [ ] Array props are memoized with useMemo
- [ ] Dependencies are correct

#### Callback Props (Need useCallback)
```tsx
// Bad
<MyComponent onClick={(id) => handleClick(id)} />

// Good
const handleClick = useCallback((id: string) => {
  // Handle click
}, []);
<MyComponent onClick={handleClick} />
```
- [ ] Callback props use useCallback
- [ ] Dependencies are correct
- [ ] No inline arrow functions

### Step 5: Update Tests

```tsx
// Update imports
import { MyComponent } from './MyComponent';

// Tests should work the same
it('renders correctly', () => {
  render(<MyComponent data={mockData} />);
  // assertions
});
```

- [ ] Update component imports if needed
- [ ] Run existing tests
- [ ] All tests pass
- [ ] Add re-render tests if needed

### Step 6: Performance Verification

- [ ] Measure new render time
- [ ] Count re-renders in typical usage
- [ ] Verify FPS improvement during scrolling
- [ ] Check CPU usage during updates
- [ ] Monitor memory usage
- [ ] Compare with baseline metrics

## Common Issues and Solutions

### Issue 1: Component Still Re-renders

**Cause**: Props are not stable

**Solution**:
```tsx
// Check parent component
const Parent = () => {
  // Bad - creates new object every render
  const data = { id: 1, name: 'test' };
  
  // Good - stable reference
  const data = useMemo(() => ({ id: 1, name: 'test' }), []);
  
  return <MyComponent data={data} />;
};
```

- [ ] Verify all props are stable
- [ ] Use useMemo for objects/arrays
- [ ] Use useCallback for functions

### Issue 2: Callbacks Don't Work

**Cause**: Missing dependencies in useCallback

**Solution**:
```tsx
// Bad
const handleClick = useCallback((id: string) => {
  doSomething(id, someValue);
}, []); // Missing someValue

// Good
const handleClick = useCallback((id: string) => {
  doSomething(id, someValue);
}, [someValue]);
```

- [ ] Add all dependencies to useCallback
- [ ] Verify callback behavior

### Issue 3: Context Changes Cause Re-renders

**Cause**: Component uses context that changes frequently

**Solution**:
```tsx
// Split context or use context selectors
const value = useContextSelector(MyContext, (state) => state.specificValue);
```

- [ ] Identify context dependencies
- [ ] Consider splitting context
- [ ] Use context selectors if available

### Issue 4: Children Prop Issues

**Cause**: Children are always new

**Solution**:
```tsx
// Avoid passing children to memoized components
// Or memoize the children
const children = useMemo(() => <div>Content</div>, []);
<MyComponent>{children}</MyComponent>
```

- [ ] Minimize use of children prop
- [ ] Memoize children if necessary

## Custom Comparison Function

When default shallow comparison isn't sufficient:

```tsx
const areEqual = (prevProps: Props, nextProps: Props) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.data.value === nextProps.data.value
  );
};

export const MyComponent = memo(MyComponentBase, areEqual);
```

- [ ] Identify specific props to compare
- [ ] Implement comparison function
- [ ] Test thoroughly
- [ ] Document comparison logic

## Testing Checklist

### Unit Tests

- [ ] Component renders correctly
- [ ] Props are passed correctly
- [ ] Callbacks work as expected
- [ ] Edge cases are handled

### Integration Tests

- [ ] Component works in list context
- [ ] Updates propagate correctly
- [ ] No regression in functionality

### Performance Tests

- [ ] Re-render count is reduced
- [ ] Render time is improved
- [ ] Memory usage is acceptable
- [ ] No performance regression

## Code Review Checklist

### For Author

- [ ] All props are stable
- [ ] useCallback used for callbacks
- [ ] useMemo used for objects/arrays
- [ ] Tests updated and passing
- [ ] Performance improvement verified
- [ ] Documentation updated

### For Reviewer

- [ ] memo usage is appropriate
- [ ] Props stability verified
- [ ] No unnecessary re-renders
- [ ] Tests are comprehensive
- [ ] Performance gains documented
- [ ] No breaking changes

## Documentation Updates

- [ ] Update component documentation
- [ ] Add performance notes
- [ ] Document prop requirements
- [ ] Update usage examples
- [ ] Add to optimization guide

## Rollout Plan

### Phase 1: High-Impact Components

- [ ] Identify most frequently rendered components
- [ ] Migrate and test individually
- [ ] Monitor production metrics

### Phase 2: Medium-Impact Components

- [ ] Migrate remaining list items
- [ ] Verify no regressions
- [ ] Update documentation

### Phase 3: Low-Impact Components

- [ ] Evaluate remaining candidates
- [ ] Migrate if beneficial
- [ ] Complete documentation

## Monitoring

### Metrics to Track

- [ ] Component render count
- [ ] Average render time
- [ ] FPS during scrolling
- [ ] CPU usage
- [ ] Memory usage
- [ ] User-reported issues

### Tools

- [ ] React DevTools Profiler
- [ ] Chrome Performance tab
- [ ] Custom performance monitoring
- [ ] Error tracking
- [ ] User analytics

## Rollback Plan

If issues arise:

1. [ ] Identify problematic component
2. [ ] Revert memo implementation
3. [ ] Investigate root cause
4. [ ] Fix underlying issue
5. [ ] Re-apply optimization
6. [ ] Verify fix

## Success Criteria

- [ ] Re-renders reduced by >80%
- [ ] Render time improved by >50%
- [ ] No functional regressions
- [ ] No memory leaks
- [ ] User experience improved
- [ ] All tests passing

## Post-Migration

- [ ] Document lessons learned
- [ ] Update best practices
- [ ] Share knowledge with team
- [ ] Plan next optimizations
- [ ] Monitor long-term performance

## Example Migration

### Before

```tsx
import React from 'react';

interface ItemProps {
  id: number;
  name: string;
  onDelete: (id: number) => void;
}

export function ListItem({ id, name, onDelete }: ItemProps) {
  return (
    <div>
      <span>{name}</span>
      <button onClick={() => onDelete(id)}>Delete</button>
    </div>
  );
}
```

### After

```tsx
import React, { memo } from 'react';

interface ItemProps {
  id: number;
  name: string;
  onDelete: (id: number) => void;
}

const ListItemBase = ({ id, name, onDelete }: ItemProps) => {
  return (
    <div>
      <span>{name}</span>
      <button onClick={() => onDelete(id)}>Delete</button>
    </div>
  );
};

export const ListItem = memo(ListItemBase);
```

### Parent Component

```tsx
import React, { useCallback, useState } from 'react';
import { ListItem } from './ListItem';

export function List() {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
  ]);

  // Stable callback with useCallback
  const handleDelete = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <div>
      {items.map(item => (
        <ListItem
          key={item.id}
          id={item.id}
          name={item.name}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

## Resources

- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useCallback Hook](https://react.dev/reference/react/useCallback)
- [useMemo Hook](https://react.dev/reference/react/useMemo)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)
- [Performance Optimization](https://react.dev/learn/render-and-commit)

## Conclusion

Following this checklist ensures successful React.memo migration with measurable performance improvements and no regressions.
