export function getRealtimeWsUrl(apiBaseUrl: string): string {
  const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;

  if (base.startsWith('https://')) {
    return `${base.replace('https://', 'wss://')}/extended/v1/ws`;
  }

  if (base.startsWith('http://')) {
    return `${base.replace('http://', 'ws://')}/extended/v1/ws`;
  }

  return `${base}/extended/v1/ws`;
}
