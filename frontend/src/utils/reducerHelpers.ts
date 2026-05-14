/**
 * Helper utilities for working with reducers
 */

export function createAction<T extends string, P = void>(
  type: T
): P extends void ? { type: T } : { type: T; payload: P } {
  return ((payload?: P) =>
    payload === undefined ? { type } : { type, payload }) as any;
}

export function combineReducers<S extends Record<string, any>>(
  reducers: { [K in keyof S]: (state: S[K], action: any) => S[K] }
) {
  return (state: S, action: any): S => {
    const nextState = {} as S;
    let hasChanged = false;

    for (const key in reducers) {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    return hasChanged ? nextState : state;
  };
}

export function createReducer<S, A extends { type: string }>(
  initialState: S,
  handlers: Record<string, (state: S, action: any) => S>
) {
  return (state: S = initialState, action: A): S => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    }
    return state;
  };
}

export function withLogging<S, A extends { type: string }>(
  reducer: (state: S, action: A) => S
) {
  return (state: S, action: A): S => {
    console.group(`Action: ${action.type}`);
    console.log('Previous State:', state);
    console.log('Action:', action);
    const nextState = reducer(state, action);
    console.log('Next State:', nextState);
    console.groupEnd();
    return nextState;
  };
}

export function withUndo<S, A extends { type: string }>(
  reducer: (state: S, action: A) => S,
  maxHistory = 10
) {
  interface UndoState {
    past: S[];
    present: S;
    future: S[];
  }

  type UndoAction = A | { type: 'UNDO' } | { type: 'REDO' } | { type: 'CLEAR_HISTORY' };

  return (state: UndoState, action: UndoAction): UndoState => {
    const { past, present, future } = state;

    switch (action.type) {
      case 'UNDO':
        if (past.length === 0) return state;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        return {
          past: newPast,
          present: previous,
          future: [present, ...future],
        };

      case 'REDO':
        if (future.length === 0) return state;
        const next = future[0];
        const newFuture = future.slice(1);
        return {
          past: [...past, present],
          present: next,
          future: newFuture,
        };

      case 'CLEAR_HISTORY':
        return {
          past: [],
          present,
          future: [],
        };

      default:
        const newPresent = reducer(present, action as A);
        if (present === newPresent) return state;

        return {
          past: [...past.slice(-maxHistory + 1), present],
          present: newPresent,
          future: [],
        };
    }
  };
}

export function createAsyncAction<T extends string>(type: T) {
  return {
    request: `${type}_REQUEST`,
    success: `${type}_SUCCESS`,
    failure: `${type}_FAILURE`,
  };
}

export function isActionType<T extends string>(
  action: { type: string },
  type: T
): action is { type: T } {
  return action.type === type;
}

export function matchAction<A extends { type: string }>(
  action: A,
  handlers: Partial<Record<A['type'], (action: A) => void>>
) {
  const handler = handlers[action.type];
  if (handler) {
    handler(action);
  }
}
