import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useContractPause } from '../useContractPause';

const fetchCallReadOnlyFunctionMock = vi.fn();
const cvToJSONMock = vi.fn();

vi.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: (...args: unknown[]) => fetchCallReadOnlyFunctionMock(...args),
  cvToJSON: (...args: unknown[]) => cvToJSONMock(...args),
}));

vi.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => ({
    stacksNetwork: {},
  }),
}));

vi.mock('../../config/contracts', () => ({
  MARKET_CONTRACT: {
    address: 'STTESTADDRESS',
    name: 'market-core',
  },
}));

describe('useContractPause', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paused=true when contract is paused', async () => {
    fetchCallReadOnlyFunctionMock.mockResolvedValue({});
    cvToJSONMock.mockReturnValue({ type: 'bool', value: true });

    const { result } = renderHook(() => useContractPause());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isPaused).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('surfaces read-only fetch errors', async () => {
    fetchCallReadOnlyFunctionMock.mockRejectedValue(new Error('network failed'));

    const { result } = renderHook(() => useContractPause());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isPaused).toBe(false);
    expect(result.current.error).toContain('network failed');
  });
});
