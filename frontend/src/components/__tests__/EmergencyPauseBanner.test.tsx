import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmergencyPauseBanner } from '../EmergencyPauseBanner';

let pauseState = false;

const useWalletMock = vi.fn(() => ({ address: 'SP2TESTPAUSE0000000000000000000000000000000' }));
const createNotificationMock = vi.fn();
const sendSystemAlertMock = vi.fn();

vi.mock('../../hooks/useContractPause', () => ({
  useContractPause: () => ({
    isPaused: pauseState,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('../../components/WalletProvider', () => ({
  useWallet: () => useWalletMock(),
}));

vi.mock('../../services/NotificationService', () => ({
  NotificationService: {
    createNotification: (...args: unknown[]) => createNotificationMock(...args),
  },
}));

vi.mock('../../services/PushNotificationService', () => ({
  PushNotificationService: {
    sendSystemAlert: (...args: unknown[]) => sendSystemAlertMock(...args),
  },
}));

describe('EmergencyPauseBanner', () => {
  beforeEach(() => {
    pauseState = false;
    useWalletMock.mockClear();
    createNotificationMock.mockReset();
    sendSystemAlertMock.mockReset();
    sendSystemAlertMock.mockResolvedValue(true);
    createNotificationMock.mockResolvedValue({
      id: 'notif_1',
      userId: 'SP2TESTPAUSE0000000000000000000000000000000',
      type: 'system_alert',
      content: { title: 'Emergency pause active', message: 'test' },
      channels: ['in_app'],
      status: 'unread',
      createdAt: new Date().toISOString(),
    });
  });

  it('announces pause and resume transitions', async () => {
    const view = render(
      <MemoryRouter>
        <EmergencyPauseBanner />
      </MemoryRouter>
    );

    expect(view.container).toBeEmptyDOMElement();
    expect(createNotificationMock).not.toHaveBeenCalled();

    pauseState = true;
    view.rerender(
      <MemoryRouter>
        <EmergencyPauseBanner />
      </MemoryRouter>
    );

    expect(view.getByText('Emergency pause active')).toBeInTheDocument();
    await waitFor(() => {
      expect(createNotificationMock).toHaveBeenCalledTimes(1);
    });
    expect(sendSystemAlertMock).toHaveBeenCalledWith(
      'Emergency pause active',
      expect.stringContaining('Trading and new market creation are temporarily disabled'),
      'circuit-breaker-pause'
    );

    pauseState = false;
    view.rerender(
      <MemoryRouter>
        <EmergencyPauseBanner />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(createNotificationMock).toHaveBeenCalledTimes(2);
    });
    expect(sendSystemAlertMock).toHaveBeenLastCalledWith(
      'Emergency pause lifted',
      expect.stringContaining('emergency pause has been lifted'),
      'circuit-breaker-resume'
    );
    expect(view.container).toBeEmptyDOMElement();
  });
});
