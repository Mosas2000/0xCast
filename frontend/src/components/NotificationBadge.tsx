import React from 'react';

interface NotificationBadgeProps {
  count: number;
  variant?: 'dot' | 'number' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  variant = 'number',
  size = 'md',
  animate = true,
  className = '',
}) => {
  if (count === 0 && variant !== 'dot') {
    return null;
  }

  const sizeClasses = {
    sm: 'h-4 w-4 text-xs',
    md: 'h-5 w-5 text-sm',
    lg: 'h-6 w-6 text-base',
  };

  const animationClass = animate ? 'animate-pulse' : '';

  if (variant === 'dot') {
    return (
      <div
        className={`absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 ${animationClass} ${className}`}
        aria-label={`${count} unread notifications`}
      />
    );
  }

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800 ${className}`}
      >
        {count > 99 ? '99+' : count}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-red-500 text-white font-bold ${sizeClasses[size]} ${animationClass} ${className}`}
      aria-label={`${count} unread notifications`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;
