import { useEffect, useRef, useState } from 'react';
import { useApi } from './useApi';
import { getRealtimeWsUrl } from '@/utils/realtime';

interface UseRealtimeSignalOptions {
  enabled?: boolean;
  reconnectIntervalMs?: number;
  fallbackIntervalMs?: number;
}

interface UseRealtimeSignalResult {
  signal: number;
  isSocketConnected: boolean;
  source: 'socket' | 'poll';
}

export function useRealtimeSignal(options: UseRealtimeSignalOptions = {}): UseRealtimeSignalResult {
  const {
    enabled = true,
    reconnectIntervalMs = 10000,
    fallbackIntervalMs = 30000,
  } = options;

  const [signal, setSignal] = useState(0);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const { baseUrl } = useApi();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let mounted = true;
    const wsUrl = getRealtimeWsUrl(baseUrl);

    const tick = () => {
      if (!mounted) return;
      setSignal((prev) => prev + 1);
    };

    const clearTimers = () => {
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (pollTimerRef.current !== null) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const startFallbackPolling = () => {
      if (pollTimerRef.current !== null) return;
      pollTimerRef.current = window.setInterval(tick, fallbackIntervalMs);
    };

    const stopFallbackPolling = () => {
      if (pollTimerRef.current !== null) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!mounted) return;
          setIsSocketConnected(true);
          stopFallbackPolling();
        };

        ws.onmessage = () => {
          tick();
        };

        ws.onerror = () => {
          if (!mounted) return;
          setIsSocketConnected(false);
          startFallbackPolling();
        };

        ws.onclose = () => {
          if (!mounted) return;
          setIsSocketConnected(false);
          startFallbackPolling();
          reconnectTimerRef.current = window.setTimeout(connect, reconnectIntervalMs);
        };
      } catch {
        if (!mounted) return;
        setIsSocketConnected(false);
        startFallbackPolling();
        reconnectTimerRef.current = window.setTimeout(connect, reconnectIntervalMs);
      }
    };

    startFallbackPolling();
    connect();

    return () => {
      mounted = false;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [baseUrl, enabled, fallbackIntervalMs, reconnectIntervalMs]);

  return {
    signal,
    isSocketConnected,
    source: isSocketConnected ? 'socket' : 'poll',
  };
}
