import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from './WalletProvider';
import { useContractPause } from '@/hooks/useContractPause';
import { NotificationService } from '@/services/NotificationService';
import { PushNotificationService } from '@/services/PushNotificationService';

export function EmergencyPauseBanner() {
  const { address } = useWallet();
  const { isPaused, isLoading } = useContractPause();
  const previousPauseState = useRef<boolean | null>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!hasMounted.current) {
      hasMounted.current = true;
      previousPauseState.current = isPaused;
      return;
    }

    if (previousPauseState.current === isPaused) {
      return;
    }

    previousPauseState.current = isPaused;

    const userId = address || 'guest';
    const title = isPaused ? 'Emergency pause active' : 'Emergency pause lifted';
    const message = isPaused
      ? 'Trading and new market creation are temporarily disabled. Claims and refunds remain available until the circuit breaker is cleared.'
      : 'The emergency pause has been lifted. Trading is available again.';

    void NotificationService.createNotification({
      type: 'system_alert',
      userId,
      content: {
        title,
        message,
        actionUrl: '/governance',
        actionText: 'Review status',
      },
      channels: ['in_app', 'push'],
      metadata: {
        source: 'market-core',
        paused: isPaused,
      },
    });

    void PushNotificationService.sendSystemAlert(title, message, isPaused ? 'circuit-breaker-pause' : 'circuit-breaker-resume');
  }, [address, isLoading, isPaused]);

  if (!isPaused) {
    return null;
  }

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 text-amber-100">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="font-semibold">Emergency pause active</p>
          <p className="text-sm text-amber-100/80">
            Trading and new market creation are paused. Claims and refunds remain available. Resumption requires approved signer confirmation.
          </p>
        </div>
        <Link
          to="/governance"
          className="shrink-0 rounded-md border border-amber-200/30 px-3 py-1.5 text-sm font-medium text-amber-50 hover:bg-amber-200/10"
        >
          Review governance
        </Link>
      </div>
    </div>
  );
}
