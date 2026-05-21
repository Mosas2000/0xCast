import React, { useState, useEffect } from 'react';
import { logger, type LogEntry, type LogLevel } from '@/utils/logger';

interface LogViewerProps {
  refreshInterval?: number;
  initialLevel?: LogLevel;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  refreshInterval = 1000,
  initialLevel = 'debug',
}) => {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [level, setLevel] = useState<LogLevel>(initialLevel);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, byLevel: {} as Record<string, number> });

  useEffect(() => {
    const updateEntries = () => {
      const allEntries = logger.getEntries();
      const filtered = allEntries.filter((entry) => {
        const levelMatch = entry.level === level;
        const filterMatch =
          !filter ||
          entry.message.toLowerCase().includes(filter.toLowerCase()) ||
          (entry.component && entry.component.toLowerCase().includes(filter.toLowerCase())) ||
          (entry.action && entry.action.toLowerCase().includes(filter.toLowerCase()));
        return levelMatch && filterMatch;
      });

      setEntries(filtered.slice(-100));
      setStats(logger.getStats());
    };

    updateEntries();
    const interval = setInterval(updateEntries, refreshInterval);

    return () => clearInterval(interval);
  }, [level, filter, refreshInterval]);

  const getLevelColor = (level: LogLevel): string => {
    const colors: Record<LogLevel, string> = {
      debug: 'text-gray-500',
      info: 'text-blue-600',
      warn: 'text-yellow-600',
      error: 'text-red-600',
      fatal: 'text-red-800 font-bold',
    };
    return colors[level];
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Log Viewer</h2>

        <div className="flex flex-wrap gap-2">
          {(['debug', 'info', 'warn', 'error', 'fatal'] as LogLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                level === lvl
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lvl.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="text-sm text-gray-600">
          Total: <span className="font-bold">{stats.total}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto font-mono text-sm">
        {entries.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No logs to display</div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry, index) => (
              <div key={index} className="py-1 border-b border-gray-200 last:border-0">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 whitespace-nowrap">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <span className={`font-bold whitespace-nowrap ${getLevelColor(entry.level)}`}>
                    [{entry.level.toUpperCase()}]
                  </span>
                  {entry.requestId && (
                    <span className="text-gray-600 whitespace-nowrap">
                      [request:{entry.requestId}]
                    </span>
                  )}
                  {entry.userId && (
                    <span className="text-gray-600 whitespace-nowrap">
                      [user:{entry.userId}]
                    </span>
                  )}
                  {entry.transactionId && (
                    <span className="text-gray-600 whitespace-nowrap">
                      [tx:{entry.transactionId}]
                    </span>
                  )}
                  {entry.component && (
                    <span className="text-gray-600 whitespace-nowrap">
                      [{entry.component}]
                    </span>
                  )}
                  {entry.action && (
                    <span className="text-gray-600 whitespace-nowrap">
                      [{entry.action}]
                    </span>
                  )}
                  <span className="text-gray-900 flex-1 break-all">{entry.message}</span>
                </div>
                {entry.context && (
                  <div className="ml-4 mt-1 text-gray-600">
                    <span className="font-semibold">Context: </span>
                    <pre className="inline text-xs">{JSON.stringify(entry.context, null, 2)}</pre>
                  </div>
                )}
                {entry.stack && (
                  <div className="ml-4 mt-1 text-gray-600">
                    <span className="font-semibold">Stack: </span>
                    <pre className="inline text-xs whitespace-pre-wrap">{entry.stack}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
