import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePaginationReducer } from '../usePaginationReducer';

describe('usePaginationReducer', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => usePaginationReducer());

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.total).toBe(0);
  });

  it('initializes with custom page size', () => {
    const { result } = renderHook(() => usePaginationReducer(20));

    expect(result.current.pageSize).toBe(20);
  });

  it('sets page', () => {
    const { result } = renderHook(() => usePaginationReducer());

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.page).toBe(3);
  });

  it('sets page size and resets to page 1', () => {
    const { result } = renderHook(() => usePaginationReducer());

    act(() => {
      result.current.setPage(3);
      result.current.setPageSize(20);
    });

    expect(result.current.pageSize).toBe(20);
    expect(result.current.page).toBe(1);
  });

  it('sets total', () => {
    const { result } = renderHook(() => usePaginationReducer());

    act(() => {
      result.current.setTotal(100);
    });

    expect(result.current.total).toBe(100);
    expect(result.current.totalPages).toBe(10);
  });

  it('navigates to next page', () => {
    const { result } = renderHook(() => usePaginationReducer());

    act(() => {
      result.current.setTotal(100);
      result.current.nextPage();
    });

    expect(result.current.page).toBe(2);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPrevPage).toBe(true);
  });

  it('navigates to previous page', () => {
    const { result } = renderHook(() => usePaginationReducer());

    act(() => {
      result.current.setTotal(100);
      result.current.setPage(3);
      result.current.prevPage();
    });

    expect(result.current.page).toBe(2);
  });

  it('does not go below page 1', () => {
    const { result } = renderHook(() => usePaginationReducer());

    act(() => {
      result.current.prevPage();
    });

    expect(result.current.page).toBe(1);
    expect(result.current.hasPrevPage).toBe(false);
  });

  it('does not exceed total pages', () => {
    const { result } = renderHook(() => usePaginationReducer());

    act(() => {
      result.current.setTotal(100);
      result.current.setPage(10);
      result.current.nextPage();
    });

    expect(result.current.page).toBe(10);
    expect(result.current.hasNextPage).toBe(false);
  });

  it('resets to initial state', () => {
    const { result } = renderHook(() => usePaginationReducer());

    act(() => {
      result.current.setPage(5);
      result.current.setTotal(100);
      result.current.reset();
    });

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);
    expect(result.current.total).toBe(0);
  });
});
