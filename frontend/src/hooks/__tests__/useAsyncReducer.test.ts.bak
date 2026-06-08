import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsyncReducer } from '../useAsyncReducer';

describe('useAsyncReducer', () => {
  it('initializes with correct state', () => {
    const { result } = renderHook(() => useAsyncReducer<string>());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles successful async operation', async () => {
    const { result } = renderHook(() => useAsyncReducer<string>());

    const asyncFn = async () => {
      return 'success';
    };

    act(() => {
      result.current.execute(asyncFn);
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe('success');
      expect(result.current.error).toBeNull();
    });
  });

  it('handles failed async operation', async () => {
    const { result } = renderHook(() => useAsyncReducer<string>());

    const asyncFn = async () => {
      throw new Error('Test error');
    };

    await act(async () => {
      try {
        await result.current.execute(asyncFn);
      } catch (error) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBe('Test error');
    });
  });

  it('resets state', async () => {
    const { result } = renderHook(() => useAsyncReducer<string>());

    const asyncFn = async () => 'success';

    await act(async () => {
      await result.current.execute(asyncFn);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
