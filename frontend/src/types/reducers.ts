/**
 * Common Types for useReducer Pattern
 */

import type { JsonValue } from './common';

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type AsyncAction<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'RESET' };

export type FormState<T> = T & {
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;
};

export type FormAction<T> =
  | { type: 'SET_FIELD'; field: keyof T; value: T[keyof T] }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_SUCCESS'; payload: string }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'RESET' };

export type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
};

export type PaginationAction =
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_TOTAL'; payload: number }
  | { type: 'NEXT_PAGE' }
  | { type: 'PREV_PAGE' }
  | { type: 'RESET' };

export type FilterState<T> = {
  filters: T;
  appliedFilters: T;
};

export type FilterAction<T> =
  | { type: 'SET_FILTER'; field: keyof T; value: T[keyof T] }
  | { type: 'APPLY_FILTERS' }
  | { type: 'RESET_FILTERS' }
  | { type: 'CLEAR_FILTERS' };

export type ModalState = {
  isOpen: boolean;
  data: JsonValue | null;
};

export type ModalAction =
  | { type: 'OPEN'; payload?: JsonValue }
  | { type: 'CLOSE' }
  | { type: 'SET_DATA'; payload: JsonValue };

export type ListState<T> = {
  items: T[];
  selectedItems: Set<string>;
  sortBy: string | null;
  sortOrder: 'asc' | 'desc';
};

export type ListAction<T> =
  | { type: 'SET_ITEMS'; payload: T[] }
  | { type: 'ADD_ITEM'; payload: T }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; data: Partial<T> } }
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'DESELECT_ITEM'; payload: string }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'SET_SORT'; payload: { by: string; order: 'asc' | 'desc' } };

export function createAsyncReducer<T>(): (
  state: AsyncState<T>,
  action: AsyncAction<T>
) => AsyncState<T> {
  return (state, action) => {
    switch (action.type) {
      case 'FETCH_START':
        return { ...state, loading: true, error: null };
      case 'FETCH_SUCCESS':
        return { data: action.payload, loading: false, error: null };
      case 'FETCH_ERROR':
        return { ...state, loading: false, error: action.payload };
      case 'RESET':
        return { data: null, loading: false, error: null };
      default:
        return state;
    }
  };
}

export function createPaginationReducer() {
  return (state: PaginationState, action: PaginationAction): PaginationState => {
    switch (action.type) {
      case 'SET_PAGE':
        return { ...state, page: action.payload };
      case 'SET_PAGE_SIZE':
        return { ...state, pageSize: action.payload, page: 1 };
      case 'SET_TOTAL':
        return { ...state, total: action.payload };
      case 'NEXT_PAGE':
        return {
          ...state,
          page: Math.min(state.page + 1, Math.ceil(state.total / state.pageSize)),
        };
      case 'PREV_PAGE':
        return { ...state, page: Math.max(state.page - 1, 1) };
      case 'RESET':
        return { page: 1, pageSize: 10, total: 0 };
      default:
        return state;
    }
  };
}

export function createModalReducer() {
  return (state: ModalState, action: ModalAction): ModalState => {
    switch (action.type) {
      case 'OPEN':
        return { isOpen: true, data: action.payload || null };
      case 'CLOSE':
        return { isOpen: false, data: null };
      case 'SET_DATA':
        return { ...state, data: action.payload };
      default:
        return state;
    }
  };
}
