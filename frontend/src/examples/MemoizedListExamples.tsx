/**
 * Memoized List Examples
 * 
 * Demonstrates proper usage of React.memo for list items
 */

import { memo, useCallback, useMemo, useState } from 'react';

// Example 1: Simple List Item with React.memo
interface SimpleItemProps {
  id: number;
  name: string;
}

const SimpleItemBase = ({ id, name }: SimpleItemProps) => {
  console.log(`SimpleItem ${id} rendered`);
  return (
    <div className="p-2 border rounded">
      <span className="font-medium">{name}</span>
    </div>
  );
};

export const SimpleItem = memo(SimpleItemBase);

// Example 2: List Item with Callback
interface ItemWithCallbackProps {
  id: number;
  name: string;
  onDelete: (id: number) => void;
}

const ItemWithCallbackBase = ({ id, name, onDelete }: ItemWithCallbackProps) => {
  console.log(`ItemWithCallback ${id} rendered`);
  return (
    <div className="p-2 border rounded flex justify-between items-center">
      <span className="font-medium">{name}</span>
      <button
        onClick={() => onDelete(id)}
        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Delete
      </button>
    </div>
  );
};

export const ItemWithCallback = memo(ItemWithCallbackBase);

// Example 3: Complex List Item with Multiple Props
interface ComplexItemProps {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'inactive';
  count: number;
  onEdit: (id: number) => void;
  onToggle: (id: number) => void;
}

const ComplexItemBase = ({
  id,
  title,
  description,
  status,
  count,
  onEdit,
  onToggle,
}: ComplexItemProps) => {
  console.log(`ComplexItem ${id} rendered`);
  
  return (
    <div className="p-4 border rounded bg-white shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <span
          className={`px-2 py-1 rounded text-xs ${
            status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status}
        </span>
      </div>
      <p className="text-gray-600 mb-2">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Count: {count}</span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(id)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => onToggle(id)}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Toggle
          </button>
        </div>
      </div>
    </div>
  );
};

export const ComplexItem = memo(ComplexItemBase);

// Example 4: Parent Component with Proper Callback Memoization
export function MemoizedListExample() {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ]);
  const [counter, setCounter] = useState(0);

  // Stable callback with useCallback
  const handleDelete = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Memoized List Example</h2>
      
      {/* This button updates parent state but shouldn't re-render list items */}
      <button
        onClick={() => setCounter(counter + 1)}
        className="mb-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Increment Counter: {counter}
      </button>

      <div className="space-y-2">
        {items.map((item) => (
          <ItemWithCallback
            key={item.id}
            id={item.id}
            name={item.name}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}

// Example 5: List with Object Props (Using useMemo)
interface ItemWithObjectProps {
  id: number;
  data: {
    title: string;
    value: number;
  };
}

const ItemWithObjectBase = ({ id, data }: ItemWithObjectProps) => {
  console.log(`ItemWithObject ${id} rendered`);
  return (
    <div className="p-2 border rounded">
      <div className="font-medium">{data.title}</div>
      <div className="text-sm text-gray-600">Value: {data.value}</div>
    </div>
  );
};

export const ItemWithObject = memo(ItemWithObjectBase);

export function ListWithObjectProps() {
  const [counter, setCounter] = useState(0);

  // Memoize object props to prevent re-renders
  const items = useMemo(
    () => [
      { id: 1, data: { title: 'Item 1', value: 100 } },
      { id: 2, data: { title: 'Item 2', value: 200 } },
      { id: 3, data: { title: 'Item 3', value: 300 } },
    ],
    []
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">List with Object Props</h2>
      
      <button
        onClick={() => setCounter(counter + 1)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Increment Counter: {counter}
      </button>

      <div className="space-y-2">
        {items.map((item) => (
          <ItemWithObject key={item.id} id={item.id} data={item.data} />
        ))}
      </div>
    </div>
  );
}

// Example 6: Custom Comparison Function
interface ItemWithCustomCompareProps {
  id: number;
  name: string;
  metadata: {
    timestamp: number;
    author: string;
  };
}

const ItemWithCustomCompareBase = ({ id, name, metadata }: ItemWithCustomCompareProps) => {
  console.log(`ItemWithCustomCompare ${id} rendered`);
  return (
    <div className="p-2 border rounded">
      <div className="font-medium">{name}</div>
      <div className="text-xs text-gray-500">By: {metadata.author}</div>
    </div>
  );
};

// Custom comparison - only re-render if id or name changes, ignore metadata.timestamp
const areEqual = (
  prevProps: ItemWithCustomCompareProps,
  nextProps: ItemWithCustomCompareProps
) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.name === nextProps.name &&
    prevProps.metadata.author === nextProps.metadata.author
  );
};

export const ItemWithCustomCompare = memo(ItemWithCustomCompareBase, areEqual);

// Example 7: Bad Practice - Inline Objects (Don't do this!)
export function BadPracticeExample() {
  const [counter, setCounter] = useState(0);

  return (
    <div className="p-4 border-2 border-red-500">
      <h2 className="text-2xl font-bold mb-4 text-red-600">
        Bad Practice - Don't Do This!
      </h2>
      
      <button
        onClick={() => setCounter(counter + 1)}
        className="mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Increment Counter: {counter}
      </button>

      <div className="space-y-2">
        {/* BAD: Inline object creates new reference every render */}
        <ItemWithObject
          id={1}
          data={{ title: 'Bad Item', value: 100 }}
        />
        
        {/* BAD: Inline arrow function creates new reference every render */}
        <ItemWithCallback
          id={2}
          name="Bad Item"
          onDelete={(id) => console.log('Delete', id)}
        />
      </div>
      
      <p className="mt-4 text-sm text-red-600">
        These items will re-render on every parent update because props are not stable!
      </p>
    </div>
  );
}

// Example 8: Good Practice - Stable Props
export function GoodPracticeExample() {
  const [counter, setCounter] = useState(0);

  // Good: Memoized object
  const itemData = useMemo(() => ({ title: 'Good Item', value: 100 }), []);

  // Good: Stable callback
  const handleDelete = useCallback((id: number) => {
    console.log('Delete', id);
  }, []);

  return (
    <div className="p-4 border-2 border-green-500">
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        Good Practice - Do This!
      </h2>
      
      <button
        onClick={() => setCounter(counter + 1)}
        className="mb-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Increment Counter: {counter}
      </button>

      <div className="space-y-2">
        {/* GOOD: Stable object reference */}
        <ItemWithObject id={1} data={itemData} />
        
        {/* GOOD: Stable callback reference */}
        <ItemWithCallback id={2} name="Good Item" onDelete={handleDelete} />
      </div>
      
      <p className="mt-4 text-sm text-green-600">
        These items will NOT re-render on parent updates because props are stable!
      </p>
    </div>
  );
}
