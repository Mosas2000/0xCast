# Reducer Migration Checklist

Use this checklist when migrating components from useState to useReducer.

## Pre-Migration Assessment

- [ ] Component has 3+ related state variables
- [ ] State updates are complex or interdependent
- [ ] Component has performance issues from multiple re-renders
- [ ] State logic would benefit from centralization

## Migration Steps

### 1. Identify State Variables

List all useState calls:
```tsx
const [field1, setField1] = useState(initial1);
const [field2, setField2] = useState(initial2);
const [field3, setField3] = useState(initial3);
```

### 2. Define State Interface

```tsx
interface ComponentState {
  field1: Type1;
  field2: Type2;
  field3: Type3;
}
```

### 3. Define Action Types

```tsx
type ComponentAction =
  | { type: 'SET_FIELD1'; payload: Type1 }
  | { type: 'SET_FIELD2'; payload: Type2 }
  | { type: 'SET_FIELD3'; payload: Type3 }
  | { type: 'RESET' };
```

### 4. Create Initial State

```tsx
const initialState: ComponentState = {
  field1: initial1,
  field2: initial2,
  field3: initial3,
};
```

### 5. Implement Reducer

```tsx
function componentReducer(state: ComponentState, action: ComponentAction): ComponentState {
  switch (action.type) {
    case 'SET_FIELD1':
      return { ...state, field1: action.payload };
    case 'SET_FIELD2':
      return { ...state, field2: action.payload };
    case 'SET_FIELD3':
      return { ...state, field3: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
```

### 6. Replace useState with useReducer

```tsx
const [state, dispatch] = useReducer(componentReducer, initialState);
```

### 7. Update State References

Replace:
```tsx
field1
```

With:
```tsx
state.field1
```

### 8. Update State Setters

Replace:
```tsx
setField1(newValue)
```

With:
```tsx
dispatch({ type: 'SET_FIELD1', payload: newValue })
```

### 9. Test Component

- [ ] All state updates work correctly
- [ ] No TypeScript errors
- [ ] Component renders properly
- [ ] Event handlers work as expected
- [ ] Form submissions work
- [ ] Reset functionality works

### 10. Optimize Actions

Look for opportunities to combine actions:
```tsx
// Before
dispatch({ type: 'SET_FIELD1', payload: value1 });
dispatch({ type: 'SET_FIELD2', payload: value2 });

// After
dispatch({ type: 'UPDATE_MULTIPLE', payload: { field1: value1, field2: value2 } });
```

## Common Patterns

### Loading States

```tsx
type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Data }
  | { type: 'FETCH_ERROR'; payload: string };
```

### Form States

```tsx
type Action =
  | { type: 'SET_FIELD'; field: keyof FormData; value: any }
  | { type: 'SET_ERROR'; field: keyof FormData; error: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'RESET' };
```

### Modal States

```tsx
type Action =
  | { type: 'OPEN'; payload?: any }
  | { type: 'CLOSE' }
  | { type: 'SET_DATA'; payload: any };
```

## Testing Checklist

- [ ] Unit tests for reducer function
- [ ] Test each action type
- [ ] Test initial state
- [ ] Test edge cases
- [ ] Integration tests for component

## Performance Verification

- [ ] Measure re-renders before migration
- [ ] Measure re-renders after migration
- [ ] Verify reduced re-render count
- [ ] Check bundle size impact

## Documentation

- [ ] Add JSDoc comments to reducer
- [ ] Document action types
- [ ] Update component documentation
- [ ] Add usage examples

## Code Review Checklist

- [ ] Reducer is pure function
- [ ] All actions are handled
- [ ] Default case returns state
- [ ] TypeScript types are correct
- [ ] No side effects in reducer
- [ ] State updates are immutable
- [ ] Action types are descriptive

## Rollback Plan

If migration causes issues:

1. Keep old useState code commented
2. Test thoroughly before removing
3. Have rollback commit ready
4. Monitor production metrics

## Success Criteria

- [ ] Component works identically to before
- [ ] Code is more maintainable
- [ ] Performance is same or better
- [ ] TypeScript types are stricter
- [ ] Tests pass
- [ ] No console errors
