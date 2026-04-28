import { getExplorerChain, getExplorerUrls } from '../../../config/network';

describe('network configuration', () => {
  describe('getExplorerChain', () => {
    it('returns mainnet for mainnet network', () => {
      expect(getExplorerChain('mainnet')).toBe('mainnet');
    });

    it('returns testnet for testnet network', () => {
      expect(getExplorerChain('testnet')).toBe('testnet');
    });

    it('returns correct chain for active network when no parameter provided', () => {
      const chain = getExplorerChain();
      expect(['mainnet', 'testnet']).toContain(chain);
    });
  });

  describe('getExplorerUrls', () => {
    it('returns mainnet URLs for mainnet network', () => {
      const urls = getExplorerUrls('mainnet');
      expect(urls.base).toBe('https://explorer.hiro.so');
      expect(urls.tx('0x123')).toContain('chain=mainnet');
      expect(urls.address('SP123')).toContain('chain=mainnet');
      expect(urls.contract('SP123.contract')).toContain('chain=mainnet');
    });

    it('returns testnet URLs for testnet network', () => {
      const urls = getExplorerUrls('testnet');
      expect(urls.base).toBe('https://explorer.hiro.so');
      expect(urls.tx('0x123')).toContain('chain=testnet');
      expect(urls.address('ST123')).toContain('chain=testnet');
      expect(urls.contract('ST123.contract')).toContain('chain=testnet');
    });

    it('returns URLs for active network when no parameter provided', () => {
      const urls = getExplorerUrls();
      expect(urls.base).toBe('https://explorer.hiro.so');
      expect(urls.tx('0x123')).toMatch(/chain=(mainnet|testnet)/);
    });
  });
});
