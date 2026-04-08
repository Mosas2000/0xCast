import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStacksNetwork,
  getNetworkConfig,
  saveNetworkPreference,
  loadNetworkPreference,
  clearNetworkPreference,
  isMainnet,
  isTestnet,
  getContractAddress,
  getContractName,
  isValidNetwork,
} from '../networkUtils';
import { NetworkType, DEFAULT_NETWORK, NETWORK_STORAGE_KEY } from '../../types/network';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('getStacksNetwork', () => {
  it('returns mainnet instance for mainnet type', () => {
    const network = getStacksNetwork(NetworkType.MAINNET);
    expect(network).toBeDefined();
  });

  it('returns testnet instance for testnet type', () => {
    const network = getStacksNetwork(NetworkType.TESTNET);
    expect(network).toBeDefined();
  });
});

describe('getNetworkConfig', () => {
  it('returns config for mainnet', () => {
    const config = getNetworkConfig(NetworkType.MAINNET);
    expect(config).toBeDefined();
    expect(config.type).toBe(NetworkType.MAINNET);
    expect(config.displayName).toBe('Mainnet');
  });

  it('returns config for testnet', () => {
    const config = getNetworkConfig(NetworkType.TESTNET);
    expect(config).toBeDefined();
    expect(config.type).toBe(NetworkType.TESTNET);
    expect(config.displayName).toBe('Testnet');
  });
});

describe('saveNetworkPreference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saves mainnet preference to localStorage', () => {
    saveNetworkPreference(NetworkType.MAINNET);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      NETWORK_STORAGE_KEY,
      NetworkType.MAINNET
    );
  });

  it('saves testnet preference to localStorage', () => {
    saveNetworkPreference(NetworkType.TESTNET);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      NETWORK_STORAGE_KEY,
      NetworkType.TESTNET
    );
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('localStorage unavailable');
    });
    
    // Should not throw
    expect(() => saveNetworkPreference(NetworkType.MAINNET)).not.toThrow();
  });
});

describe('loadNetworkPreference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads mainnet preference from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce(NetworkType.MAINNET);
    expect(loadNetworkPreference()).toBe(NetworkType.MAINNET);
  });

  it('loads testnet preference from localStorage', () => {
    localStorageMock.getItem.mockReturnValueOnce(NetworkType.TESTNET);
    expect(loadNetworkPreference()).toBe(NetworkType.TESTNET);
  });

  it('returns default network for invalid value', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid');
    expect(loadNetworkPreference()).toBe(DEFAULT_NETWORK);
  });

  it('returns default network when no preference saved', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    expect(loadNetworkPreference()).toBe(DEFAULT_NETWORK);
  });

  it('returns default network on localStorage error', () => {
    localStorageMock.getItem.mockImplementationOnce(() => {
      throw new Error('localStorage unavailable');
    });
    expect(loadNetworkPreference()).toBe(DEFAULT_NETWORK);
  });
});

describe('clearNetworkPreference', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes network preference from localStorage', () => {
    clearNetworkPreference();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(NETWORK_STORAGE_KEY);
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.removeItem.mockImplementationOnce(() => {
      throw new Error('localStorage unavailable');
    });
    
    expect(() => clearNetworkPreference()).not.toThrow();
  });
});

describe('isMainnet', () => {
  it('returns true for mainnet', () => {
    expect(isMainnet(NetworkType.MAINNET)).toBe(true);
  });

  it('returns false for testnet', () => {
    expect(isMainnet(NetworkType.TESTNET)).toBe(false);
  });
});

describe('isTestnet', () => {
  it('returns true for testnet', () => {
    expect(isTestnet(NetworkType.TESTNET)).toBe(true);
  });

  it('returns false for mainnet', () => {
    expect(isTestnet(NetworkType.MAINNET)).toBe(false);
  });
});

describe('getContractAddress', () => {
  it('returns mainnet contract address', () => {
    const address = getContractAddress(NetworkType.MAINNET);
    expect(address).toBe('SP31PKQVQZVZCK3FM3NH67CGD6G1FMR17VQVS2W5T');
    expect(address.startsWith('SP')).toBe(true);
  });

  it('returns testnet contract address', () => {
    const address = getContractAddress(NetworkType.TESTNET);
    expect(address.startsWith('ST')).toBe(true);
  });

  it('returns valid Stacks address format', () => {
    const mainnetAddr = getContractAddress(NetworkType.MAINNET);
    const testnetAddr = getContractAddress(NetworkType.TESTNET);
    
    // Check length (Stacks addresses are 41 characters)
    expect(mainnetAddr.length).toBe(41);
    expect(testnetAddr.length).toBe(41);
  });
});

describe('getContractName', () => {
  it('returns the contract name', () => {
    expect(getContractName()).toBe('0xcast-v1');
  });

  it('returns consistent value', () => {
    expect(getContractName()).toBe(getContractName());
  });
});

describe('isValidNetwork', () => {
  it('returns true for mainnet string', () => {
    expect(isValidNetwork('mainnet')).toBe(true);
  });

  it('returns true for testnet string', () => {
    expect(isValidNetwork('testnet')).toBe(true);
  });

  it('returns false for invalid network strings', () => {
    expect(isValidNetwork('devnet')).toBe(false);
    expect(isValidNetwork('production')).toBe(false);
    expect(isValidNetwork('')).toBe(false);
    expect(isValidNetwork('MAINNET')).toBe(false); // Case sensitive
  });
});
