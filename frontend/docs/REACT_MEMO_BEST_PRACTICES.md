# React.memo Best Practices

## Overview

This document outlines best practices for using React.memo effectively in list item components and other frequently rendered components.

## Core Principles

### 1. Stable Props

Always ensure props passed to memoized components are stable (same reference across renders).

#### Bad Practice

```tsx
function ParentComponent() {
  return (
    <div>
      {/* New object created every render */}
      <MemoizedItem data={{ id: 1, name: 'Item' }} />
      
      {/* New function created every render */}
      <MemoizedItem onClick={() => console.log('clicked')} />
      
      {/* New array created every render */}
      <MemoizedItem tags={['tag1', 'tag2']} />
    </div>
  );
}
```

#### Good Practice

```tsx
function ParentComponent() {
  // Memoize objects
  const data = useMemo(() => ({ id: 1, name: 'Item' }), []);
  
  // Memoize callbacks
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  // Memoize arrays
  const tags = useMemo(() => ['tag1', 'tag2'], []);
  
  return (
    <div>
      <MemoizedItem data={data} />
      <MemoizedItem onClick={handleClick} />
      <MemoizedItem tags={tags} />
    </div>
  );
}
```

### 2. Use useCallback for Event Handlers

Always wrap event handlers in useCallback when passing to memoized components.

#### Bad Practice

```tsx
function List() {
  const [items, setItems] = useState([...]);
  
  return (
    <div>
      {items.map(item => (
        <MemoizedItem
          key={item.id}
          item={item}
          // New function every render
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </div>
  );
}
```

#### Good Practice

```tsx
function List() {
  const [items, setItems] = useState([...]);
  
  // Stable callback
  const handleDelete = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <MemoizedItem
          key={item.id}
          item={item}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### 3. Prefer Primitive Props

When possible, pass primitive values instead of objects.

#### Less Optimal

```tsx
<MemoizedItem user={{ id: 1, name: 'John', email: 'john@example.com' }} />
```

#### More Optimal

```tsx
<MemoizedItem userId={1} userName="John" userEmail="john@example.com" />
```

### 4. Avoid Children Prop

Children are always new, defeating memoization.

#### Bad Practice

```tsx
<MemoizedItem>
  <div>Content</div>
</MemoizedItem>
```

#### Good Practice

```tsx
// Pass content as a prop
<MemoizedItem content={<div>Content</div>} />

// Or memoize children
const children = useMemo(() => <div>Content</div>, []);
<MemoizedItem>{children}</MemoizedItem>
```

## Component Patterns

### Pattern 1: Simple List Item

```tsx
import { memo } from 'react';

interface ItemProps {
  id: number;
  name: string;
}

const ItemBase = ({ id, name }: ItemProps) => (
  <div>{name}</div>
);

export const Item = memo(ItemBase);
```

### Pattern 2: Item with Callback

```tsx
import { memo } from 'react';

interface ItemProps {
  id: number;
  name: string;
  onAction: (id: number) => void;
}

const ItemBase = ({ id, name, onAction }: ItemProps) => (
  <div>
    <span>{name}</span>
    <button onClick={() => onAction(id)}>Action</button>
  </div>
);

export const Item = memo(ItemBase);
```

### Pattern 3: Item with Complex Props

```tsx
import { memo } from 'react';

interface ItemData {
  id: number;
  title: string;
  metadata: {
    author: string;
    date: string;
  };
}

interface ItemProps {
  data: ItemData;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const ItemBase = ({ data, onEdit, onDelete }: ItemProps) => (
  <div>
    <h3>{data.title}</h3>
    <p>By {data.metadata.author}</p>
    <button onClick={() => onEdit(data.id)}>Edit</button>
    <button onClick={() => onDelete(data.id)}>Delete</button>
  </div>
);

export const Item = memo(ItemBase);
```

### Pattern 4: Custom Comparison

```tsx
import { memo } from 'react';

interface ItemProps {
  id: number;
  name: string;
  timestamp: number; // Frequently changing, but not important for display
}

const ItemBase = ({ id, name }: ItemProps) => (
  <div>{name}</div>
);

// Only re-render if id or name changes
const areEqual = (prev: ItemProps, next: ItemProps) => {
  return prev.id === next.id && prev.name === next.name;
};

export const Item = memo(ItemBase, areEqual);
```

## Parent Component Patterns

### Pattern 1: List with Stable Callbacks

```tsx
import { useState, useCallback } from 'react';
import { Item } from './Item';

export function List() {
  const [items, setItems] = useState([...]);
  
  const handleEdit = useCallback((id: number) => {
    // Edit logic
  }, []);
  
  const handleDelete = useCallback((id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);
  
  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          id={item.id}
          name={item.name}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
```

### Pattern 2: List with Memoized Data

```tsx
import { useState, useMemo, useCallback } from 'react';
import { Item } from './Item';

export function List() {
  const [items, setItems] = useState([...]);
  const [filter, setFilter] = useState('');
  
  // Memoize filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);
  
  const handleAction = useCallback((id: number) => {
    // Action logic
  }, []);
  
  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter..."
      />
      {filteredItems.map(item => (
        <Item
          key={item.id}
          id={item.id}
          name={item.name}
          onAction={handleAction}
        />
      ))}
    </div>
  );
}
```

## Common Mistakes

### Mistake 1: Forgetting useCallback

```tsx
// Wrong - new function every render
<Item onAction={(id) => handleAction(id)} />

// Correct
const handleAction = useCallback((id: number) => {
  // logic
}, []);
<Item onAction={handleAction} />
```

### Mistake 2: Missing Dependencies

```tsx
// Wrong - missing dependency
const handleAction = useCallback((id: number) => {
  doSomething(id, someValue);
}, []); // Missing someValue

// Correct
const handleAction = useCallback((id: number) => {
  doSomething(id, someValue);
}, [someValue]);
```

### Mistake 3: Inline Objects

```tsx
// Wrong
<Item style={{ margin: 10 }} />

// Correct
const itemStyle = { margin: 10 };
<Item style={itemStyle} />

// Or
const itemStyle = useMemo(() => ({ margin: 10 }), []);
<Item style={itemStyle} />
```

### Mistake 4: Unnecessary Memoization

```tsx
// Wrong - over-memoization
const value = useMemo(() => 5, []); // Primitive, no need to memoize

// Correct
const value = 5;
```

## Performance Considerations

### When to Use React.memo

Use React.memo when:
- Component renders frequently
- Component is in a list
- Parent re-renders often
- Props don't change frequently
- Component is expensive to render

### When NOT to Use React.memo

Don't use React.memo when:
- Component rarely re-renders
- Props always change
- Component is very simple
- Memoization overhead > render cost

## Testing Memoization

### Visual Testing

```tsx
const ItemBase = ({ id, name }: ItemProps) => {
  console.log(`Item ${id} rendered`);
  return <div>{name}</div>;
};

export const Item = memo(ItemBase);
```

### Automated Testing

```tsx
import { render } from '@testing-library/react';
import { Item } from './Item';

it('does not re-render with same props', () => {
  const { rerender } = render(<Item id={1} name="Test" />);
  
  // Re-render with same props
  rerender(<Item id={1} name="Test" />);
  
  // Check render count (implementation specific)
});
```

## Debugging

### React DevTools Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Start recording
4. Interact with component
5. Check "Why did this render?"

### Console Logging

```tsx
const ItemBase = ({ id, name }: ItemProps) => {
  const renderCount = useRef(0);
  renderCount.current++;
  
  console.log(`Item ${id} rendered ${renderCount.current} times`);
  
  return <div>{name}</div>;
};
```

## Checklist

Before using React.memo:

- [ ] Component renders frequently
- [ ] Props are stable or memoized
- [ ] Callbacks use useCallback
- [ ] Objects/arrays use useMemo
- [ ] No inline object/function creation
- [ ] Tested for performance improvement
- [ ] No breaking changes

## Resources

- [React.memo API](https://react.dev/reference/react/memo)
- [useCallback Hook](https://react.dev/reference/react/useCallback)
- [useMemo Hook](https://react.dev/reference/react/useMemo)
- [Optimizing Performance](https://react.dev/learn/render-and-commit)

## Conclusion

Following these best practices ensures React.memo provides maximum performance benefits without introducing bugs or unnecessary complexity.
