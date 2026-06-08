import { render, screen, fireEvent } from '@testing-library/react';
import {
  SimpleItem,
  ItemWithCallback,
  ComplexItem,
  MemoizedListExample,
  ListWithObjectProps,
} from '../MemoizedListExamples';

describe('Memoized List Components', () => {
  describe('SimpleItem', () => {
    it('renders correctly', () => {
      render(<SimpleItem id={1} name="Test Item" />);
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('does not re-render with same props', () => {
      const { rerender } = render(<SimpleItem id={1} name="Test Item" />);
      const element = screen.getByText('Test Item');
      
      rerender(<SimpleItem id={1} name="Test Item" />);
      
      expect(element).toBeInTheDocument();
    });
  });

  describe('ItemWithCallback', () => {
    it('renders correctly', () => {
      const mockDelete = jest.fn();
      render(<ItemWithCallback id={1} name="Test Item" onDelete={mockDelete} />);
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls onDelete with correct id', () => {
      const mockDelete = jest.fn();
      render(<ItemWithCallback id={1} name="Test Item" onDelete={mockDelete} />);
      
      fireEvent.click(screen.getByText('Delete'));
      
      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('does not re-render when callback reference is stable', () => {
      const mockDelete = jest.fn();
      const { rerender } = render(
        <ItemWithCallback id={1} name="Test Item" onDelete={mockDelete} />
      );
      
      rerender(<ItemWithCallback id={1} name="Test Item" onDelete={mockDelete} />);
      
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
  });

  describe('ComplexItem', () => {
    const defaultProps = {
      id: 1,
      title: 'Test Title',
      description: 'Test Description',
      status: 'active' as const,
      count: 5,
      onEdit: jest.fn(),
      onToggle: jest.fn(),
    };

    it('renders all content correctly', () => {
      render(<ComplexItem {...defaultProps} />);
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
      expect(screen.getByText('Count: 5')).toBeInTheDocument();
    });

    it('calls onEdit with correct id', () => {
      const mockEdit = jest.fn();
      render(<ComplexItem {...defaultProps} onEdit={mockEdit} />);
      
      fireEvent.click(screen.getByText('Edit'));
      
      expect(mockEdit).toHaveBeenCalledWith(1);
    });

    it('calls onToggle with correct id', () => {
      const mockToggle = jest.fn();
      render(<ComplexItem {...defaultProps} onToggle={mockToggle} />);
      
      fireEvent.click(screen.getByText('Toggle'));
      
      expect(mockToggle).toHaveBeenCalledWith(1);
    });

    it('displays correct status styling', () => {
      const { rerender } = render(<ComplexItem {...defaultProps} status="active" />);
      
      let statusElement = screen.getByText('active');
      expect(statusElement).toHaveClass('bg-green-100');
      
      rerender(<ComplexItem {...defaultProps} status="inactive" />);
      
      statusElement = screen.getByText('inactive');
      expect(statusElement).toHaveClass('bg-gray-100');
    });
  });

  describe('MemoizedListExample', () => {
    it('renders initial items', () => {
      render(<MemoizedListExample />);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('increments counter without re-rendering items', () => {
      render(<MemoizedListExample />);
      
      const button = screen.getByText(/Increment Counter:/);
      expect(button).toHaveTextContent('Increment Counter: 0');
      
      fireEvent.click(button);
      
      expect(button).toHaveTextContent('Increment Counter: 1');
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('deletes item when delete button is clicked', () => {
      render(<MemoizedListExample />);
      
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('ListWithObjectProps', () => {
    it('renders items with object props', () => {
      render(<ListWithObjectProps />);
      
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Value: 100')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Value: 200')).toBeInTheDocument();
    });

    it('increments counter without re-rendering items', () => {
      render(<ListWithObjectProps />);
      
      const button = screen.getByText(/Increment Counter:/);
      expect(button).toHaveTextContent('Increment Counter: 0');
      
      fireEvent.click(button);
      
      expect(button).toHaveTextContent('Increment Counter: 1');
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });
});
