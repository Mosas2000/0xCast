/**
 * OracleStatusBadge Component
 * 
 * Displays oracle registration and reliability status as a badge.
 * Useful for showing oracle status in various contexts.
 */

import type { OracleStats } from '@/types/oracle';

interface OracleStatusBadgeProps {
  oracle?: OracleStats | null;
  isLoading?: boolean;
  showReliability?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function OracleStatusBadge({
  oracle,
  isLoading = false,
  showReliability = true,
  size = 'md',
}: OracleStatusBadgeProps) {
  if (isLoading) {
    return (
      <div className={`inline-flex items-center gap-2 ${
        size === 'sm' ? 'px-2 py-1' :
        size === 'lg' ? 'px-4 py-2' :
        'px-3 py-1.5'
      } bg-gray-700/50 rounded-full animate-pulse`}>
        <div className={`${
          size === 'sm' ? 'w-2 h-2' :
          size === 'lg' ? 'w-3 h-3' :
          'w-2.5 h-2.5'
        } rounded-full bg-gray-600`} />
        <div className={`${
          size === 'sm' ? 'w-12 h-3' :
          size === 'lg' ? 'w-16 h-5' :
          'w-14 h-4'
        } bg-gray-600 rounded`} />
      </div>
    );
  }

  if (!oracle) {
    return (
      <div className={`inline-flex items-center gap-2 ${
        size === 'sm' ? 'px-2 py-1 text-xs' :
        size === 'lg' ? 'px-4 py-2 text-base' :
        'px-3 py-1.5 text-sm'
      } bg-gray-700/50 text-gray-400 rounded-full`}>
        <div className={`${
          size === 'sm' ? 'w-2 h-2' :
          size === 'lg' ? 'w-3 h-3' :
          'w-2.5 h-2.5'
        } rounded-full bg-gray-500`} />
        <span>Not an Oracle</span>
      </div>
    );
  }

  const reliabilityColor = 
    oracle.reliability >= 90 ? 'text-green-400' :
    oracle.reliability >= 70 ? 'text-yellow-400' :
    'text-red-400';

  const statusColor = oracle.isRegistered
    ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : 'bg-gray-700/50 text-gray-400 border-gray-600';

  const dotColor = oracle.isRegistered ? 'bg-green-500' : 'bg-gray-500';

  return (
    <div className={`inline-flex items-center gap-2 ${
      size === 'sm' ? 'px-2 py-1 text-xs' :
      size === 'lg' ? 'px-4 py-2 text-base' :
      'px-3 py-1.5 text-sm'
    } ${statusColor} rounded-full border`}>
      <div className={`${
        size === 'sm' ? 'w-2 h-2' :
        size === 'lg' ? 'w-3 h-3' :
        'w-2.5 h-2.5'
      } rounded-full ${dotColor} ${oracle.isRegistered ? 'animate-pulse' : ''}`} />
      <span>{oracle.isRegistered ? 'Oracle' : 'Not Registered'}</span>
      {showReliability && oracle.isRegistered && (
        <>
          <span className="text-gray-500">•</span>
          <span className={reliabilityColor}>{oracle.reliability}%</span>
        </>
      )}
    </div>
  );
}

/**
 * OracleReliabilityMeter Component
 * 
 * Visual meter showing oracle reliability percentage.
 */
interface OracleReliabilityMeterProps {
  reliability: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function OracleReliabilityMeter({
  reliability,
  showLabel = true,
  size = 'md',
}: OracleReliabilityMeterProps) {
  const color = 
    reliability >= 90 ? 'bg-green-500' :
    reliability >= 70 ? 'bg-yellow-500' :
    'bg-red-500';

  const textColor = 
    reliability >= 90 ? 'text-green-400' :
    reliability >= 70 ? 'text-yellow-400' :
    'text-red-400';

  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex justify-between items-center mb-1 ${textSize}`}>
          <span className="text-gray-400">Reliability</span>
          <span className={textColor}>{reliability}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-gray-700 rounded-full overflow-hidden`}>
        <div 
          className={`${height} ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${reliability}%` }}
        />
      </div>
    </div>
  );
}

/**
 * OracleStatsRow Component
 * 
 * Compact stats display for oracle performance.
 */
interface OracleStatsRowProps {
  oracle: OracleStats;
  compact?: boolean;
}

export function OracleStatsRow({ oracle, compact = false }: OracleStatsRowProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-400">
          <span className="text-white font-medium">{oracle.totalResolutions}</span> resolutions
        </span>
        <span className="text-gray-400">
          <span className="text-green-400 font-medium">{oracle.successfulResolutions}</span> successful
        </span>
        <span className="text-gray-400">
          <span className="text-yellow-400 font-medium">{oracle.disputedResolutions}</span> disputed
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
        <p className="text-xl font-bold text-white">{oracle.totalResolutions}</p>
        <p className="text-xs text-gray-400">Total</p>
      </div>
      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
        <p className="text-xl font-bold text-green-400">{oracle.successfulResolutions}</p>
        <p className="text-xs text-gray-400">Successful</p>
      </div>
      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
        <p className="text-xl font-bold text-yellow-400">{oracle.disputedResolutions}</p>
        <p className="text-xs text-gray-400">Disputed</p>
      </div>
    </div>
  );
}
