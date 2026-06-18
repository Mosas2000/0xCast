import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { fetchCallReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { NetworkType } from '../types/network';
import { usePosition } from '../hooks/usePosition';
import { useStakingData } from '../hooks/useStakingData';
import { useNetwork } from '../contexts/NetworkContext';

vi.mock('@stacks/transactions', async () => {
  const actual = await vi.importActual<typeof import('@stacks/transactions')>('@stacks/transactions');
  return {
    ...actual,
    fetchCallReadOnlyFunction: vi.fn(),
    cvToJSON: vi.fn(),
  };
});

vi.mock('../contexts/NetworkContext', () => ({
  useNetwork: vi.fn(),
}));

const fetchCallReadOnlyFunctionMock = vi.mocked(fetchCallReadOnlyFunction);
const cvToJSONMock = vi.mocked(cvToJSON);
const useNetworkMock = vi.mocked(useNetwork);

function mockNetworkContext(network: NetworkType) {
  return network === NetworkType.MAINNET
    ? {
        network,
        networkConfig: { apiUrl: 'https://api.mainnet.hiro.so' },
        stacksNetwork: STACKS_MAINNET,
        contractAddress: 'SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T',
        contractName: '0xcast-v1',
        isMainnet: true,
        isTestnet: false,
        setNetwork: vi.fn(),
        toggleNetwork: vi.fn(),
      }
    : {
        network,
        networkConfig: { apiUrl: 'https://api.testnet.hiro.so' },
        stacksNetwork: STACKS_TESTNET,
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        contractName: '0xcast-v1',
        isMainnet: false,
        isTestnet: true,
        setNetwork: vi.fn(),
        toggleNetwork: vi.fn(),
      };
}

describe('network-aware read-only hooks', () => {
  beforeEach(() => {
    fetchCallReadOnlyFunctionMock.mockReset();
    cvToJSONMock.mockReset();
    useNetworkMock.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses mainnet when fetching user positions on mainnet', async () => {
    useNetworkMock.mockReturnValue(mockNetworkContext(NetworkType.MAINNET) as never);

    fetchCallReadOnlyFunctionMock.mockImplementation(async ({ functionName }) => {
      return { functionName } as never;
    });

    cvToJSONMock.mockImplementation((value: { functionName: string }) => {
      if (value.functionName === 'get-user-position') {
        return {
          type: 'some',
          value: {
            'yes-stake': { value: '1000000' },
            'no-stake': { value: '0' },
            claimed: false,
          },
        };
      }

      return { type: 'none' };
    });

    renderHook(() => usePosition(12, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'));

    await waitFor(() => {
      expect(fetchCallReadOnlyFunctionMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchCallReadOnlyFunctionMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        network: STACKS_MAINNET,
        contractName: 'market-core',
      })
    );
  });

  it('uses testnet when fetching user positions on testnet', async () => {
    useNetworkMock.mockReturnValue(mockNetworkContext(NetworkType.TESTNET) as never);

    fetchCallReadOnlyFunctionMock.mockImplementation(async ({ functionName }) => {
      return { functionName } as never;
    });

    cvToJSONMock.mockImplementation((value: { functionName: string }) => {
      if (value.functionName === 'get-user-position') {
        return {
          type: 'some',
          value: {
            'yes-stake': { value: '1000000' },
            'no-stake': { value: '0' },
            claimed: false,
          },
        };
      }

      return { type: 'none' };
    });

    renderHook(() => usePosition(12, 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'));

    await waitFor(() => {
      expect(fetchCallReadOnlyFunctionMock).toHaveBeenCalledTimes(1);
    });

    expect(fetchCallReadOnlyFunctionMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        network: STACKS_TESTNET,
        contractName: 'market-core',
      })
    );
  });

  it('uses mainnet when fetching staking data on mainnet', async () => {
    useNetworkMock.mockReturnValue(mockNetworkContext(NetworkType.MAINNET) as never);

    fetchCallReadOnlyFunctionMock.mockImplementation(async ({ functionName }) => {
      return { functionName } as never;
    });

    cvToJSONMock.mockImplementation((value: { functionName: string }) => {
      if (value.functionName === 'get-total-staked') {
        return { value: { value: '1000000' } };
      }

      if (value.functionName === 'get-stake') {
        return {
          value: {
            amount: { value: '250000' },
            'locked-until': { value: '100' },
          },
        };
      }

      if (value.functionName === 'get-balance') {
        return { value: { value: '500000' } };
      }

      return { value: null };
    });

    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValue({
      json: async () => ({ stacks_tip_height: 200 }),
    } as Response);

    renderHook(() => useStakingData('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'));

    await waitFor(() => {
      expect(fetchCallReadOnlyFunctionMock).toHaveBeenCalledTimes(3);
    });

    expect(fetchMock).toHaveBeenCalledWith('https://api.mainnet.hiro.so/v2/info');
  });

  it('uses testnet when fetching staking data on testnet', async () => {
    useNetworkMock.mockReturnValue(mockNetworkContext(NetworkType.TESTNET) as never);

    fetchCallReadOnlyFunctionMock.mockImplementation(async ({ functionName }) => {
      return { functionName } as never;
    });

    cvToJSONMock.mockImplementation((value: { functionName: string }) => {
      if (value.functionName === 'get-total-staked') {
        return { value: { value: '1000000' } };
      }

      if (value.functionName === 'get-stake') {
        return {
          value: {
            amount: { value: '250000' },
            'locked-until': { value: '100' },
          },
        };
      }

      if (value.functionName === 'get-balance') {
        return { value: { value: '500000' } };
      }

      return { value: null };
    });

    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValue({
      json: async () => ({ stacks_tip_height: 200 }),
    } as Response);

    renderHook(() => useStakingData('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'));

    await waitFor(() => {
      expect(fetchCallReadOnlyFunctionMock).toHaveBeenCalledTimes(3);
    });

    expect(fetchMock).toHaveBeenCalledWith('https://api.testnet.hiro.so/v2/info');
  });
});
