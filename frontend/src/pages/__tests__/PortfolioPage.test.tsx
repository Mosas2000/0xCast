import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PortfolioPage } from '../PortfolioPage';

const fetchCallReadOnlyFunctionMock = vi.fn();
const cvToJSONMock = vi.fn();
const parsePositionMock = vi.fn();

const networkContext = {
  stacksNetwork: { network: 'testnet' },
  contractAddress: 'STTESTCONTRACT',
  contractName: 'market-core',
};

vi.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: (...args: unknown[]) => fetchCallReadOnlyFunctionMock(...args),
  cvToJSON: (...args: unknown[]) => cvToJSONMock(...args),
  uintCV: (value: number) => ({ type: 'uint', value }),
  principalCV: (value: string) => ({ type: 'principal', value }),
}));

vi.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => networkContext,
}));

vi.mock('../../components/WalletProvider', () => ({
  useWallet: () => ({
    isConnected: true,
    connect: vi.fn(),
    address: 'SPTESTUSER',
  }),
}));

vi.mock('../../hooks/useMarkets', () => ({
  useMarkets: () => ({
    markets: [
      {
        id: 1,
        question: 'Will STX reach $5?',
        creator: 'SPCREATOR',
        endDate: 100,
        resolutionDate: 200,
        totalYesStake: 100,
        totalNoStake: 50,
        status: 0,
        outcome: 0,
        createdAt: 10,
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('../../hooks/useContract', () => ({
  useContract: () => ({
    claimWinnings: vi.fn(),
  }),
}));

vi.mock('../../utils/helpers', async () => {
  const actual = await vi.importActual<typeof import('../../utils/helpers')>('../../utils/helpers');
  return {
    ...actual,
    parsePosition: (...args: unknown[]) => parsePositionMock(...args),
  };
});

describe('PortfolioPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the active network for position reads', async () => {
    parsePositionMock.mockReturnValue({
      marketId: 1,
      user: 'SPTESTUSER',
      yesStake: 100,
      noStake: 0,
      claimed: false,
    });
    cvToJSONMock.mockReturnValue({
      type: 'some',
      value: { position: 'ok' },
    });
    fetchCallReadOnlyFunctionMock.mockResolvedValue({});

    render(React.createElement(MemoryRouter, null, React.createElement(PortfolioPage)));

    await waitFor(() => {
      expect(fetchCallReadOnlyFunctionMock).toHaveBeenCalled();
    });

    expect(fetchCallReadOnlyFunctionMock.mock.calls[0][0]).toMatchObject({
      network: networkContext.stacksNetwork,
      contractAddress: networkContext.contractAddress,
      contractName: networkContext.contractName,
      functionName: 'get-user-position',
    });
  });
});
