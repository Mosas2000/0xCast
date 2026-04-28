import { getTransactionExplorerUrl, getAddressExplorerUrl, getContractExplorerUrl } from '../explorerLinks';

describe('explorerLinks', () => {
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
