import { describe, expect, it } from 'vitest';
import { getExplorerAddressUrl, getExplorerUrl } from '../transactions';
import { NetworkType } from '../../types/network';

describe('transactions explorer helpers', () => {
  it('builds network-aware transaction explorer URLs', () => {
    expect(getExplorerUrl('0xabc', NetworkType.MAINNET)).toBe(
      'https://explorer.hiro.so/txid/0xabc?chain=mainnet'
    );
    expect(getExplorerUrl('0xabc', NetworkType.TESTNET)).toBe(
      'https://explorer.hiro.so/txid/0xabc?chain=testnet'
    );
  });

  it('builds network-aware address explorer URLs', () => {
    expect(getExplorerAddressUrl('SPTEST', NetworkType.MAINNET)).toBe(
      'https://explorer.hiro.so/address/SPTEST?chain=mainnet'
    );
    expect(getExplorerAddressUrl('STTEST', NetworkType.TESTNET)).toBe(
      'https://explorer.hiro.so/address/STTEST?chain=testnet'
    );
  });
});
