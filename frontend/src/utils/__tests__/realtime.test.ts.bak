import { describe, it, expect } from 'vitest';
import { getRealtimeWsUrl } from '../realtime';

describe('getRealtimeWsUrl', () => {
  it('converts https base URL to wss websocket URL', () => {
    expect(getRealtimeWsUrl('https://api.mainnet.hiro.so')).toBe('wss://api.mainnet.hiro.so/extended/v1/ws');
  });

  it('converts http base URL to ws websocket URL', () => {
    expect(getRealtimeWsUrl('http://localhost:3999')).toBe('ws://localhost:3999/extended/v1/ws');
  });

  it('handles base URL with trailing slash', () => {
    expect(getRealtimeWsUrl('https://api.testnet.hiro.so/')).toBe('wss://api.testnet.hiro.so/extended/v1/ws');
  });
});
