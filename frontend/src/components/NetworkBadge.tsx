/**
 * Network Badge Component
 * 
 * Visual indicator showing current network status
 */

import { useNetwork } from '../contexts/NetworkContext';

interface NetworkBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

export function NetworkBadge({ size = 'md', showPulse = true, className = '' }: NetworkBadgeProps) {
  const { networkConfig, isTestnet } = useNetwork();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return (
    <div
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `${networkConfig.color}15`,
        color: networkConfig.color,
        border: `1px solid ${networkConfig.color}30`,
      }}
    >
      <span className="relative flex items-center justify-center">
        <span
          className={`${dotSizes[size]} rounded-full`}
          style={{ backgroundColor: networkConfig.color }}
        />
        {showPulse && (
          <span
            className={`absolute ${dotSizes[size]} rounded-full animate-ping opacity-75`}
            style={{ backgroundColor: networkConfig.color }}
          />
        )}
      </span>
      <span>{networkConfig.label}</span>
      {isTestnet && <span className="opacity-60">(Test)</span>}
    </div>
  );
}

/**
 * Simple dot indicator for network status
 */
interface NetworkDotProps {
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export function NetworkDot({ size = 'md', showPulse = false }: NetworkDotProps) {
  const { networkConfig } = useNetwork();

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <span 
      className="relative flex items-center justify-center"
      title={`Connected to ${networkConfig.label}`}
    >
      <span
        className={`${dotSizes[size]} rounded-full`}
        style={{ backgroundColor: networkConfig.color }}
      />
      {showPulse && (
        <span
          className={`absolute ${dotSizes[size]} rounded-full animate-ping opacity-75`}
          style={{ backgroundColor: networkConfig.color }}
        />
      )}
    </span>
  );
}

/**
 * Inline network indicator with icon
 */
export function NetworkIndicator() {
  const { networkConfig, isTestnet } = useNetwork();
  
  return (
    <span 
      className="inline-flex items-center gap-1 text-sm"
      style={{ color: networkConfig.color }}
    >
      <span>{networkConfig.icon}</span>
      <span className="font-medium">{networkConfig.label}</span>
      {isTestnet && (
        <span className="text-xs opacity-70">(Test)</span>
      )}
    </span>
  );
}
