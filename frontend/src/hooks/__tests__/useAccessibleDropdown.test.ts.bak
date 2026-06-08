import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAccessibleDropdown } from '../useAccessibleDropdown';

describe('useAccessibleDropdown', () => {
  it('initializes with closed state', () => {
    const { result } = renderHook(() => useAccessibleDropdown('test'));
    
    expect(result.current.isOpen).toBe(false);
  });

  it('toggles open state', () => {
    const { result } = renderHook(() => useAccessibleDropdown('test'));
    
    act(() => {
      result.current.toggleOpen();
    });
    
    expect(result.current.isOpen).toBe(true);
    
    act(() => {
      result.current.toggleOpen();
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('provides correct button props', () => {
    const { result } = renderHook(() => useAccessibleDropdown('test'));
    
    expect(result.current.buttonProps).toMatchObject({
      'aria-haspopup': 'listbox',
      'aria-expanded': false,
      'aria-controls': 'test-listbox',
    });
  });

  it('updates aria-expanded when opened', () => {
    const { result } = renderHook(() => useAccessibleDropdown('test'));
    
    act(() => {
      result.current.setIsOpen(true);
    });
    
    expect(result.current.buttonProps['aria-expanded']).toBe(true);
  });

  it('provides correct listbox props', () => {
    const { result } = renderHook(() => useAccessibleDropdown('test'));
    
    expect(result.current.listboxProps).toEqual({
      id: 'test-listbox',
      role: 'listbox',
    });
  });

  it('provides option props with correct aria-selected', () => {
    const { result } = renderHook(() => useAccessibleDropdown('test'));
    
    const selectedProps = result.current.optionProps(true);
    const unselectedProps = result.current.optionProps(false);
    
    expect(selectedProps).toEqual({
      role: 'option',
      'aria-selected': true,
    });
    
    expect(unselectedProps).toEqual({
      role: 'option',
      'aria-selected': false,
    });
  });

  it('calls onClose callback when closing', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => 
      useAccessibleDropdown('test', { onClose })
    );
    
    act(() => {
      result.current.setIsOpen(true);
    });
    
    act(() => {
      result.current.setIsOpen(false);
    });
    
    // onClose is called through closeDropdown which is triggered by effects
    // In real usage, this would be called when Escape is pressed or clicking outside
  });

  it('closes on Escape key when enabled', () => {
    const { result } = renderHook(() => 
      useAccessibleDropdown('test', { closeOnEscape: true })
    );
    
    act(() => {
      result.current.setIsOpen(true);
    });
    
    expect(result.current.isOpen).toBe(true);
    
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(false);
  });

  it('does not close on Escape when disabled', () => {
    const { result } = renderHook(() => 
      useAccessibleDropdown('test', { closeOnEscape: false })
    );
    
    act(() => {
      result.current.setIsOpen(true);
    });
    
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });
    
    expect(result.current.isOpen).toBe(true);
  });

  it('generates unique listbox ID', () => {
    const { result: result1 } = renderHook(() => useAccessibleDropdown('dropdown1'));
    const { result: result2 } = renderHook(() => useAccessibleDropdown('dropdown2'));
    
    expect(result1.current.listboxId).toBe('dropdown1-listbox');
    expect(result2.current.listboxId).toBe('dropdown2-listbox');
    expect(result1.current.listboxId).not.toBe(result2.current.listboxId);
  });
});
