import React, { useState, useEffect } from 'react';
import { formatRewardAmount } from '../utils/liquidityRewardsCalculator';

interface RewardNotificationProps {
  amount: number;
  onDismiss?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const RewardNotification: React.FC<RewardNotificationProps> = ({
  amount,
  onDismiss,
  autoHide = true,
  autoHideDelay = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 flex items-center space-x-4 max-w-md">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold">Reward Earned!</p>
          <p className="text-sm">
            You earned {formatRewardAmount(amount)} STX
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="flex-shrink-0 text-white hover:text-gray-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

interface RewardNotificationManagerProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  amount: number;
}

export const RewardNotificationManager: React.FC<
  RewardNotificationManagerProps
> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleRewardEvent = (event: CustomEvent) => {
      const { amount } = event.detail;
      const id = `reward-${Date.now()}`;
      setNotifications((prev) => [...prev, { id, amount }]);
    };

    window.addEventListener(
      'liquidityReward' as any,
      handleRewardEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        'liquidityReward' as any,
        handleRewardEvent as EventListener
      );
    };
  }, []);

  const handleDismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{ transform: `translateY(${index * 80}px)` }}
          >
            <RewardNotification
              amount={notification.amount}
              onDismiss={() => handleDismiss(notification.id)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export function emitRewardNotification(amount: number): void {
  const event = new CustomEvent('liquidityReward', {
    detail: { amount },
  });
  window.dispatchEvent(event);
}
