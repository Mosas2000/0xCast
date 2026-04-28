import { getTransactionExplorerUrl, getAddressExplorerUrl, getContractExplorerUrl, isValidNetworkType, isValidExplorerUrl } from '../explorerLinks';

describe('explorerLinks', () => {
  describe('isValidNetworkType', () => {
    it('returns true for mainnet', () => {
      expect(isValidNetworkType('mainnet')).toBe(true);
    });

    it('returns true for testnet', () => {
      expect(isValidNetworkType('testnet')).toBe(true);
    });

    it('returns false for invalid values', () => {
      expect(isValidNetworkType('devnet')).toBe(false);
      expect(isValidNetworkType('production')).toBe(false);
      expect(isValidNetworkType('')).toBe(false);
      expect(isValidNetworkType('MAINNET')).toBe(false);
    });
  });

  describe('isValidExplorerUrl', () => {
    it('returns true for valid mainnet explorer URLs', () => {
      expect(isValidExplorerUrl('https://explorer.hiro.so/txid/0x123?chain=mainnet')).toBe(true);
      expect(isValidExplorerUrl('https://explorer.hiro.so/address/SP123?chain=mainnet')).toBe(true);
    });

    it('returns true for valid testnet explorer URLs', () => {
      expect(isValidExplorerUrl('https://explorer.hiro.so/txid/0x123?chain=testnet')).toBe(true);
      expect(isValidExplorerUrl('https://explorer.hiro.so/address/ST123?chain=testnet')).toBe(true);
    });

    it('returns false for URLs without chain parameter', () => {
      expect(isValidExplorerUrl('https://explorer.hiro.so/txid/0x123')).toBe(false);
    });

    it('returns false for non-explorer URLs', () => {
      expect(isValidExplorerUrl('https://example.com?chain=mainnet')).toBe(false);
      expect(isValidExplorerUrl('https://google.com')).toBe(false);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidExplorerUrl('not-a-url')).toBe(false);
      expect(isValidExplorerUrl('')).toBe(false);
    });
  });

  describe('getTransactionExplorerUrl', () => {
    it('returns mainnet URL when network is mainnet', () => {
      const txId = '0x1234567890abcdef';
      const url = getTransactionExplorerUrl(txId, 'mainnet');
      expect(url).toBe('https://explorer.hiro.so/txid/0x1234567890abcdef?chain=mainnet');
    });

    it('returns testnet URL when network is testnet', () => {
      const txId = '0x1234567890abcdef';
      const url = getTransactionExplorerUrl(txId, 'testnet');
      expect(url).toBe('https://explorer.hiro.so/txid/0x1234567890abcdef?chain=testnet');
    });

    it('uses active network when no network parameter provided', () => {
      const txId = '0x1234567890abcdef';
      const url = getTransactionExplorerUrl(txId);
      expect(url).toContain('https://explorer.hiro.so/txid/0x1234567890abcdef');
      expect(url).toMatch(/chain=(mainnet|testnet)/);
    });
  });

  describe('getAddressExplorerUrl', () => {
    it('returns mainnet URL when network is mainnet', () => {
      const address = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      const url = getAddressExplorerUrl(address, 'mainnet');
      expect(url).toBe('https://explorer.hiro.so/address/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7?chain=mainnet');
    });

    it('returns testnet URL when network is testnet', () => {
      const address = 'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE';
      const url = getAddressExplorerUrl(address, 'testnet');
      expect(url).toBe('https://explorer.hiro.so/address/ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE?chain=testnet');
    });

    it('uses active network when no network parameter provided', () => {
      const address = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      const url = getAddressExplorerUrl(address);
      expect(url).toContain('https://explorer.hiro.so/address/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7');
      expect(url).toMatch(/chain=(mainnet|testnet)/);
    });
  });

  describe('getContractExplorerUrl', () => {
    it('returns mainnet URL when network is mainnet', () => {
      const identifier = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-contract';
      const url = getContractExplorerUrl(identifier, 'mainnet');
      expect(url).toBe('https://explorer.hiro.so/txid/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-contract?chain=mainnet');
    });

    it('returns testnet URL when network is testnet', () => {
      const identifier = 'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE.my-contract';
      const url = getContractExplorerUrl(identifier, 'testnet');
      expect(url).toBe('https://explorer.hiro.so/txid/ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE.my-contract?chain=testnet');
    });

    it('uses active network when no network parameter provided', () => {
      const identifier = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-contract';
      const url = getContractExplorerUrl(identifier);
      expect(url).toContain('https://explorer.hiro.so/txid/SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-contract');
      expect(url).toMatch(/chain=(mainnet|testnet)/);
    });

    it('handles contract identifiers with hyphens', () => {
      const identifier = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-complex-contract-name';
      const url = getContractExplorerUrl(identifier, 'mainnet');
      expect(url).toContain('my-complex-contract-name');
    });
  });

  describe('edge cases', () => {
    it('handles transaction IDs with special characters', () => {
      const txId = '0xabcdef1234567890';
      const url = getTransactionExplorerUrl(txId, 'mainnet');
      expect(url).toContain(txId);
    });

    it('handles addresses with different prefixes', () => {
      const spAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
      const stAddress = 'ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKPVKG2CE';
      
      expect(getAddressExplorerUrl(spAddress, 'mainnet')).toContain(spAddress);
      expect(getAddressExplorerUrl(stAddress, 'testnet')).toContain(stAddress);
    });
  });
});
