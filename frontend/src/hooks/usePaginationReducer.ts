import { useReducer, useCallback } from 'react';
import { PaginationState, PaginationAction } from '@/types/reducers';

const initialState: PaginationState = {
  page: 1,
  pageSize: 10,
  total: 0,
};

function paginationReducer(state: PaginationState, action: PaginationAction): PaginationState {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.payload, page: 1 };
    case 'SET_TOTAL':
      return { ...state, total: action.payload };
    case 'NEXT_PAGE': {
      const maxPage = Math.ceil(state.total / state.pageSize);
      return { ...state, page: Math.min(state.page + 1, maxPage) };
    }
    case 'PREV_PAGE':
      return { ...state, page: Math.max(state.page - 1, 1) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function usePaginationReducer(initialPageSize = 10) {
  const [state, dispatch] = useReducer(paginationReducer, {
    ...initialState,
    pageSize: initialPageSize,
  });

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    dispatch({ type: 'SET_PAGE_SIZE', payload: pageSize });
  }, []);

  const setTotal = useCallback((total: number) => {
    dispatch({ type: 'SET_TOTAL', payload: total });
  }, []);

  const nextPage = useCallback(() => {
    dispatch({ type: 'NEXT_PAGE' });
  }, []);

  const prevPage = useCallback(() => {
    dispatch({ type: 'PREV_PAGE' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const totalPages = Math.ceil(state.total / state.pageSize);
  const hasNextPage = state.page < totalPages;
  const hasPrevPage = state.page > 1;

  return {
    ...state,
    setPage,
    setPageSize,
    setTotal,
    nextPage,
    prevPage,
    reset,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}
