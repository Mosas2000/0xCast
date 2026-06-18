import { renderHook, act } from '@testing-library/react';
import { useFormReducer } from '../useFormReducer';

interface TestForm {
  email: string;
  password: string;
}

const initialFormState: TestForm = {
  email: '',
  password: '',
};

describe('useFormReducer', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    expect(result.current.values).toEqual(initialFormState);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual(new Set());
    expect(result.current.isSubmitting).toBe(false);
  });

  it('sets field value', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    act(() => {
      result.current.setValue('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('sets multiple fields', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    act(() => {
      result.current.setValue('email', 'test@example.com');
      result.current.setValue('password', 'password123');
    });

    expect(result.current.values).toEqual({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('sets field error', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    act(() => {
      result.current.setError('email', 'Invalid email format');
    });

    expect(result.current.errors.email).toBe('Invalid email format');
  });

  it('clears field error when value is set', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    act(() => {
      result.current.setError('email', 'Invalid email');
    });

    act(() => {
      result.current.setValue('email', 'valid@example.com');
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('marks field as touched', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    act(() => {
      result.current.setTouched('email');
    });

    expect(result.current.touched.has('email')).toBe(true);
  });

  it('sets submitting state', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    act(() => {
      result.current.setSubmitting(true);
    });

    expect(result.current.isSubmitting).toBe(true);
  });

  it('resets form to initial state', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    act(() => {
      result.current.setValue('email', 'test@example.com');
      result.current.setValue('password', 'password123');
      result.current.setError('email', 'Error');
      result.current.setTouched('email');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialFormState);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual(new Set());
    expect(result.current.isSubmitting).toBe(false);
  });

  it('validates all fields', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    const validator = (values: TestForm) => {
      const errors: Partial<Record<keyof TestForm, string>> = {};
      if (!values.email) errors.email = 'Email required';
      if (!values.password) errors.password = 'Password required';
      return errors;
    };

    act(() => {
      result.current.validate(validator);
    });

    expect(result.current.errors).toEqual({
      email: 'Email required',
      password: 'Password required',
    });
  });

  it('checks if form has errors', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    expect(result.current.hasErrors()).toBe(false);

    act(() => {
      result.current.setError('email', 'Invalid');
    });

    expect(result.current.hasErrors()).toBe(true);
  });

  it('checks if form is valid', () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));

    expect(result.current.isValid()).toBe(true);

    act(() => {
      result.current.setError('email', 'Invalid');
    });

    expect(result.current.isValid()).toBe(false);
  });

  it('handles submit with validation', async () => {
    const { result } = renderHook(() => useFormReducer<TestForm>(initialFormState));
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    const validator = (values: TestForm) => {
      const errors: Partial<Record<keyof TestForm, string>> = {};
      if (!values.email) errors.email = 'Email required';
      return errors;
    };

    await act(async () => {
      await result.current.handleSubmit(onSubmit, validator);
    });

    expect(onSubmit).not.toHaveBeenCalled();

    act(() => {
      result.current.setValue('email', 'test@example.com');
      result.current.setValue('password', 'password');
    });

    await act(async () => {
      await result.current.handleSubmit(onSubmit, validator);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });
});
