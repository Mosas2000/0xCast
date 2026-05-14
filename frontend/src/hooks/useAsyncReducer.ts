import { useReducer, useCallback } from 'react';
import { AsyncState, AsyncAction } from '../types/reducers';

const initialAsyncState = {
  data: null,
  loading: false,
  error: null,
};

function asyncReducer<T>(state: AsyncState<T>, action: AsyncAction<T>): AsyncState<T> {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { data: action.payload, loading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'RESET':
      return initialAsyncState;
    default:
      return state;
  }
}

export function useAsyncReducer<T>() {
  const [state, dispatch] = useReducer(asyncReducer<T>, initialAsyncState as AsyncState<T>);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const result = await asyncFn();
      dispatch({ type: 'FETCH_SUCCESS', payload: result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
