/**
 * OracleCard Component
 * 
 * Displays oracle information in a card format.
 * Shows stats, reputation, and status.
 */

import type { OracleStats } from '../types/oracle';

interface OracleCardProps {
  oracle: OracleStats;
  onSelect?: (address: string) => void;
  compact?: boolean;
}

export function OracleCard({ oracle, onSelect, compact = false }: OracleCardProps) {
  const reliabilityColor = 
    oracle.reliability >= 90 ? 'text-green-400' :
    oracle.reliability >= 70 ? 'text-yellow-400' :
    'text-red-400';

  const reliabilityBg =
    oracle.reliability >= 90 ? 'bg-green-500/20' :
    oracle.reliability >= 70 ? 'bg-yellow-500/20' :
    'bg-red-500/20';

  if (compact) {
    return (
      <div 
        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
        onClick={() => onSelect?.(oracle.address)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${oracle.isRegistered ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-white font-mono text-sm truncate max-w-[200px]">
            {oracle.address}
          </span>
        </div>
        <div className={`px-2 py-1 rounded ${reliabilityBg}`}>
          <span className={`text-sm font-medium ${reliabilityColor}`}>
            {oracle.reliability}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-purple-500/50 transition-colors cursor-pointer"
      onClick={() => onSelect?.(oracle.address)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            oracle.isRegistered ? 'bg-purple-500/20' : 'bg-gray-700'
          }`}>
            <svg className={`w-5 h-5 ${oracle.isRegistered ? 'text-purple-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              oracle.isRegistered 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-700 text-gray-400'
            }`}>
              {oracle.isRegistered ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-lg ${reliabilityBg}`}>
          <span className={`text-lg font-bold ${reliabilityColor}`}>
            {oracle.reliability}%
          </span>
        </div>
      </div>

      {/* Address */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-1">Address</p>
        <p className="text-white font-mono text-sm break-all">
          {oracle.address}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-700/30 rounded-lg">
          <p className="text-xl font-bold text-white">{oracle.totalResolutions}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="text-center p-3 bg-gray-700/30 rounded-lg">
          <p className="text-xl font-bold text-green-400">{oracle.successfulResolutions}</p>
          <p className="text-xs text-gray-400">Success</p>
        </div>
        <div className="text-center p-3 bg-gray-700/30 rounded-lg">
          <p className="text-xl font-bold text-yellow-400">{oracle.disputedResolutions}</p>
          <p className="text-xs text-gray-400">Disputed</p>
        </div>
      </div>
    </div>
  );
}

/**
 * OracleCardSkeleton Component
 * 
 * Loading placeholder for OracleCard.
 */
export function OracleCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-gray-600" />
          <div className="h-4 w-40 bg-gray-700 rounded" />
        </div>
        <div className="h-6 w-12 bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700" />
          <div className="h-5 w-16 bg-gray-700 rounded" />
        </div>
        <div className="h-8 w-14 bg-gray-700 rounded-lg" />
      </div>
      <div className="mb-4">
        <div className="h-3 w-16 bg-gray-700 rounded mb-2" />
        <div className="h-4 w-full bg-gray-700 rounded" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="text-center p-3 bg-gray-700/30 rounded-lg">
            <div className="h-6 w-8 bg-gray-700 rounded mx-auto mb-1" />
            <div className="h-3 w-12 bg-gray-700 rounded mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
