import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeSignal } from '../useRealtimeSignal';

vi.mock('../useApi', () => ({
  useApi: () => ({
    baseUrl: 'https://api.mainnet.hiro.so',
  }),
}));

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor() {
    MockWebSocket.instances.push(this);
  }

  close() {
    if (this.onclose) this.onclose();
  }
}

describe('useRealtimeSignal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockWebSocket.instances = [];
    (global as { WebSocket: typeof MockWebSocket }).WebSocket = MockWebSocket;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('uses polling fallback when websocket is not open', () => {
    const { result } = renderHook(() => useRealtimeSignal({ fallbackIntervalMs: 5000, reconnectIntervalMs: 2000 }));
    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.onerror?.();
    });

    expect(result.current.source).toBe('poll');
    expect(result.current.isSocketConnected).toBe(false);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.signal).toBeGreaterThan(0);
  });

  it('switches to socket source when websocket opens', () => {
    const { result } = renderHook(() => useRealtimeSignal());
    const socket = MockWebSocket.instances[0];

    expect(socket).toBeDefined();
    act(() => {
      socket.onopen?.();
    });

    expect(result.current.isSocketConnected).toBe(true);
    expect(result.current.source).toBe('socket');
  });
});
