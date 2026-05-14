# State Management Guide

## Overview

This guide explains when and how to use `useReducer` for state management in React components.

## When to Use useReducer

Use `useReducer` instead of multiple `useState` calls when:

1. **Multiple Related State Values**: Component has 3+ related state variables that change together
2. **Complex State Logic**: State updates depend on previous state or involve multiple sub-values
3. **State Transitions**: Clear state transitions that can be modeled as actions
4. **Better Performance**: Reducing re-renders by batching state updates

## Benefits

- **Centralized Logic**: All state updates in one place
- **Predictable Updates**: Actions make state changes explicit
- **Easier Testing**: Reducers are pure functions
- **Better Performance**: Single state object reduces re-renders
- **Type Safety**: TypeScript discriminated unions for actions

## Pattern

### Basic Structure

```tsx
interface State {
  field1: string;
  field2: number;
  field3: boolean;
}

type Action =
  | { type: 'SET_FIELD1'; payload: string }
  | { type: 'SET_FIELD2'; payload: number }
  | { type: 'TOGGLE_FIELD3' }
  | { type: 'RESET' };

const initialState: State = {
  field1: '',
  field2: 0,
  field3: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD1':
      return { ...state, field1: action.payload };
    case 'SET_FIELD2':
      return { ...state, field2: action.payload };
    case 'TOGGLE_FIELD3':
      return { ...state, field3: !state.field3 };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function Component() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <div>
      <input 
        value={state.field1} 
        onChange={(e) => dispatch({ type: 'SET_FIELD1', payload: e.target.value })}
      />
    </div>
  );
}
```

## Examples

### Form State Management

```tsx
interface FormState {
  email: string;
  password: string;
  isSubmitting: boolean;
  error: string | null;
}

type FormAction =
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload, error: null };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload, error: null };
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, error: null };
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false, email: '', password: '' };
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
```

### Dashboard State

```tsx
interface DashboardState {
  data: any[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    dateRange: string;
  };
}

type DashboardAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: any[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'SET_FILTER'; payload: { key: string; value: string } }
  | { type: 'RESET_FILTERS' };

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FILTER':
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.key]: action.payload.value,
        },
      };
    case 'RESET_FILTERS':
      return { ...state, filters: { category: '', dateRange: '' } };
    default:
      return state;
  }
}
```

## Migration from useState

### Before

```tsx
function Component() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await api.submit({ name, email });
      setName('');
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
}
```

### After

```tsx
interface State {
  name: string;
  email: string;
  isSubmitting: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string };

function Component() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleSubmit = async () => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      await api.submit({ name: state.name, email: state.email });
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', payload: err.message });
    }
  };
}
```

## Best Practices

1. **Keep Reducers Pure**: No side effects in reducers
2. **Use Descriptive Action Types**: Clear, uppercase action names
3. **Type Safety**: Use TypeScript discriminated unions
4. **Single Responsibility**: One reducer per logical state domain
5. **Immutable Updates**: Always return new state objects
6. **Action Creators**: Consider creating helper functions for complex actions

## Performance Considerations

- useReducer batches state updates automatically
- Reduces number of re-renders compared to multiple useState
- Better for components with frequent state updates
- Easier to optimize with React.memo

## Testing

Reducers are easy to test as pure functions:

```tsx
describe('formReducer', () => {
  it('sets email', () => {
    const state = { email: '', password: '', isSubmitting: false, error: null };
    const action = { type: 'SET_EMAIL', payload: 'test@example.com' };
    const newState = formReducer(state, action);
    expect(newState.email).toBe('test@example.com');
  });
});
```

## Resources

- [React useReducer Documentation](https://react.dev/reference/react/useReducer)
- [When to use useReducer](https://kentcdodds.com/blog/should-i-usestate-or-usereducer)
