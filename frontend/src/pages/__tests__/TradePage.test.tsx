import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TradePage } from '../TradePage';

const fetchCallReadOnlyFunctionMock = vi.fn();
const cvToJSONMock = vi.fn();
const parseMarketDataMock = vi.fn();
const recordMarketMock = vi.fn();

const networkContext = {
  network: 'testnet',
  stacksNetwork: { network: 'testnet' },
  contractAddress: 'STTESTCONTRACT',
  contractName: 'market-core',
};

vi.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: (...args: unknown[]) => fetchCallReadOnlyFunctionMock(...args),
  cvToJSON: (...args: unknown[]) => cvToJSONMock(...args),
  uintCV: (value: number) => ({ type: 'uint', value }),
}));

vi.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => networkContext,
}));

vi.mock('../../contexts/RecentlyViewedContext', () => ({
  useRecentlyViewed: () => ({
    recordMarket: recordMarketMock,
  }),
}));

vi.mock('../../components/WalletProvider', () => ({
  useWallet: () => ({
    isConnected: false,
    connect: vi.fn(),
    address: null,
  }),
}));

vi.mock('../../hooks/useStake', () => ({
  useStake: () => ({
    placeYesStake: vi.fn(),
    placeNoStake: vi.fn(),
    isLoading: false,
    error: null,
    txId: null,
    isContractPaused: false,
  }),
}));

vi.mock('../../hooks/useRealtimeSignal', () => ({
  useRealtimeSignal: () => ({
    signal: 0,
    source: null,
    isSocketConnected: false,
  }),
}));

vi.mock('../../utils/helpers', async () => {
  const actual = await vi.importActual<typeof import('../../utils/helpers')>('../../utils/helpers');
  return {
    ...actual,
    parseMarketData: (...args: unknown[]) => parseMarketDataMock(...args),
  };
});

vi.mock('../../components/SocialButtons', () => ({
  SocialButtons: () => <div data-testid="social-buttons" />,
}));

describe('TradePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the active network for market reads', async () => {
    parseMarketDataMock.mockReturnValue({
      id: 1,
      question: 'Will STX reach $5?',
      creator: 'SPTEST',
      endDate: 100,
      resolutionDate: 200,
      totalYesStake: 100,
      totalNoStake: 50,
      status: 0,
      outcome: 0,
      createdAt: 10,
    });
    cvToJSONMock.mockReturnValue({
      type: 'some',
      value: { market: 'ok' },
    });
    fetchCallReadOnlyFunctionMock.mockResolvedValue({});

    const { container } = render(
      React.createElement(
        MemoryRouter,
        { initialEntries: ['/trade/1'] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, { path: '/trade/:id', element: React.createElement(TradePage) })
        )
      )
    );

    await waitFor(() => {
      expect(fetchCallReadOnlyFunctionMock).toHaveBeenCalled();
    });

    expect(fetchCallReadOnlyFunctionMock.mock.calls[0][0]).toMatchObject({
      network: networkContext.stacksNetwork,
      contractAddress: networkContext.contractAddress,
      contractName: networkContext.contractName,
      functionName: 'get-market',
    });

    await waitFor(() => {
      expect(recordMarketMock).toHaveBeenCalledWith(1);
    });

    expect(
      container.querySelector('a[href="https://explorer.hiro.so/address/SPTEST?chain=testnet"]')
    ).toBeTruthy();
  });
});
