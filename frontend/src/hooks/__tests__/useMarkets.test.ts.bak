import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMarkets } from '../useMarkets';

const fetchCallReadOnlyFunctionMock = vi.fn();
const cvToJSONMock = vi.fn();
const parseMarketDataMock = vi.fn();

const networkState = {
  network: 'mainnet',
  stacksNetwork: { network: 'mainnet', id: 'mainnet-net' },
};

vi.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: (...args: unknown[]) => fetchCallReadOnlyFunctionMock(...args),
  cvToJSON: (...args: unknown[]) => cvToJSONMock(...args),
  uintCV: (value: number) => ({ type: 'uint', value }),
}));

vi.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => networkState,
}));

vi.mock('../../config/contracts', () => ({
  MARKET_CONTRACT: {
    address: 'STTESTADDRESS',
    name: 'market-core',
  },
}));

vi.mock('../../utils/helpers', () => ({
  parseMarketData: (...args: unknown[]) => parseMarketDataMock(...args),
}));

describe('useMarkets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    networkState.network = 'mainnet';
    networkState.stacksNetwork = { network: 'mainnet', id: 'mainnet-net' };
  });

  it('uses the active network when fetching markets and refetches on network change', async () => {
    fetchCallReadOnlyFunctionMock.mockResolvedValue({});
    cvToJSONMock
      .mockReturnValueOnce({ value: 1 })
      .mockReturnValueOnce({ type: 'some', value: { market: 'initial' } })
      .mockReturnValueOnce({ value: 1 })
      .mockReturnValueOnce({ type: 'some', value: { market: 'updated' } });

    parseMarketDataMock.mockImplementation((id: number, value: { market: string }) => ({
      id,
      question: value.market,
      creator: 'SPTEST',
      endDate: 100,
      resolutionDate: 200,
      totalYesStake: 0,
      totalNoStake: 0,
      status: 0,
      outcome: 0,
      createdAt: 1,
    }));

    const { result, rerender } = renderHook(() => useMarkets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchCallReadOnlyFunctionMock.mock.calls[0][0]).toMatchObject({
      network: networkState.stacksNetwork,
      contractAddress: 'STTESTADDRESS',
      contractName: 'market-core',
      functionName: 'get-market-counter',
    });

    networkState.network = 'testnet';
    networkState.stacksNetwork = { network: 'testnet', id: 'testnet-net' };
    rerender();

    await waitFor(() => {
      expect(fetchCallReadOnlyFunctionMock).toHaveBeenCalledTimes(4);
    });

    expect(fetchCallReadOnlyFunctionMock.mock.calls[2][0]).toMatchObject({
      network: networkState.stacksNetwork,
      functionName: 'get-market-counter',
    });
    expect(result.current.currentNetwork).toBe('testnet');
  });
});
