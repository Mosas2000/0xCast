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
  isMainnet: false,
  isTestnet: true,
  networkConfig: { label: 'Testnet', color: '#F59E0B', icon: '🟡' },
  setNetwork: vi.fn(),
  switchNetwork: vi.fn(),
  toggleNetwork: vi.fn(),
};

vi.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: (...args: unknown[]) => fetchCallReadOnlyFunctionMock(...args),
  cvToJSON: (...args: unknown[]) => cvToJSONMock(...args),
  uintCV: (value: number) => ({ type: 'uint', value }),
}));

vi.mock('@stacks/connect', () => ({
  openContractCall: vi.fn(),
}));

vi.mock('../../contexts/NetworkContext', () => ({
  useNetwork: () => networkContext,
}));

vi.mock('../../config/contracts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../config/contracts')>();
  return {
    ...actual,
    MARKET_CONTRACT: {
      address: 'STTESTCONTRACT',
      name: 'market-core',
      identifier: 'STTESTCONTRACT.market-core',
    },
  };
});

vi.mock('../../components/WalletProvider', () => ({
  useWallet: () => ({
    isConnected: false,
    connect: vi.fn(),
    address: null,
  }),
}));



vi.mock('../../utils/helpers', async () => {
  const actual = await vi.importActual<typeof import('../../utils/helpers')>('../../utils/helpers');
  return {
    ...actual,
    parseMarketData: (...args: unknown[]) => parseMarketDataMock(...args),
  };
});



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
      <MemoryRouter initialEntries={['/market/1']}>
        <Routes>
          <Route path="/market/:id" element={<TradePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetchCallReadOnlyFunctionMock).toHaveBeenCalled();
    });

    expect(fetchCallReadOnlyFunctionMock.mock.calls[0][0]).toMatchObject({
      network: networkContext.stacksNetwork,
      contractAddress: 'STTESTCONTRACT',
      contractName: 'market-core',
      functionName: 'get-market',
    });

    await waitFor(() => {
      expect(
        container.querySelector('a[href="https://explorer.hiro.so/address/SPTEST?chain=testnet"]')
      ).toBeTruthy();
    });
  });
});
