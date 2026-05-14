import { useReducer, useCallback } from 'react';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

type FormAction<T> =
  | { type: 'SET_FIELD'; field: keyof T; value: T[keyof T] }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'CLEAR_ERROR'; field: keyof T }
  | { type: 'SET_TOUCHED'; field: keyof T }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET'; payload?: T };

function createFormReducer<T>() {
  return (state: FormState<T>, action: FormAction<T>): FormState<T> => {
    switch (action.type) {
      case 'SET_FIELD':
        return {
          ...state,
          values: { ...state.values, [action.field]: action.value },
        };
      case 'SET_ERROR':
        return {
          ...state,
          errors: { ...state.errors, [action.field]: action.error },
          isValid: false,
        };
      case 'CLEAR_ERROR': {
        const newErrors = { ...state.errors };
        delete newErrors[action.field];
        return {
          ...state,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      }
      case 'SET_TOUCHED':
        return {
          ...state,
          touched: { ...state.touched, [action.field]: true },
        };
      case 'SET_SUBMITTING':
        return { ...state, isSubmitting: action.payload };
      case 'RESET':
        return {
          values: action.payload || state.values,
          errors: {},
          touched: {},
          isSubmitting: false,
          isValid: true,
        };
      default:
        return state;
    }
  };
}

export function useFormReducer<T extends Record<string, any>>(
  initialValues: T,
  validate?: (values: T) => Partial<Record<keyof T, string>>
) {
  const initialState: FormState<T> = {
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  };

  const [state, dispatch] = useReducer(createFormReducer<T>(), initialState);

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    dispatch({ type: 'SET_FIELD', field, value });
    
    if (validate) {
      const errors = validate({ ...state.values, [field]: value });
      if (errors[field]) {
        dispatch({ type: 'SET_ERROR', field, error: errors[field] as string });
      } else {
        dispatch({ type: 'CLEAR_ERROR', field });
      }
    }
  }, [state.values, validate]);

  const setFieldTouched = useCallback((field: keyof T) => {
    dispatch({ type: 'SET_TOUCHED', field });
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    dispatch({ type: 'SET_ERROR', field, error });
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  const setSubmitting = useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', payload: isSubmitting });
  }, []);

  const reset = useCallback((values?: T) => {
    dispatch({ type: 'RESET', payload: values });
  }, []);

  const validateForm = useCallback(() => {
    if (!validate) return true;

    const errors = validate(state.values);
    let isValid = true;

    Object.entries(errors).forEach(([field, error]) => {
      if (error) {
        dispatch({ type: 'SET_ERROR', field: field as keyof T, error: error as string });
        isValid = false;
      }
    });

    return isValid;
  }, [state.values, validate]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      const isValid = validateForm();
      if (!isValid) return;

      setSubmitting(true);
      try {
        await onSubmit(state.values);
      } finally {
        setSubmitting(false);
      }
    },
    [state.values, validateForm, setSubmitting]
  );

  return {
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    clearFieldError,
    setSubmitting,
    reset,
    validateForm,
    handleSubmit,
  };
}
