import { useState, useEffect } from 'react';
import { performanceMonitor } from '../utils/performanceMonitor';

export function PerformanceDashboard() {
  const [summary, setSummary] = useState<Record<string, any>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateSummary = () => {
      setSummary(performanceMonitor.getSummary());
    };

    updateSummary();
    const interval = setInterval(updateSummary, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return null;
  }

  const operations = Object.keys(summary);

  return (
    <div className="fixed top-20 right-4 w-96 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Performance Metrics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-neutral-500 hover:text-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {operations.length === 0 ? (
        <p className="text-sm text-neutral-500">No performance data yet</p>
      ) : (
        <div className="space-y-4">
          {operations.map(op => (
            <div key={op} className="border border-neutral-800 rounded-lg p-3">
              <h4 className="text-xs font-medium text-white mb-2">{op}</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Calls</span>
                  <span className="text-white">{summary[op].count}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Avg Duration</span>
                  <span className="text-white">{summary[op].averageDuration.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Cache Hit Rate</span>
                  <span className="text-green-400">{summary[op].cacheHitRate.toFixed(1)}%</span>
                </div>
                {summary[op].improvement > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Improvement</span>
                    <span className="text-green-400">+{summary[op].improvement.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          performanceMonitor.clear();
          setSummary({});
        }}
        className="mt-4 w-full py-2 px-3 text-sm bg-neutral-800 hover:bg-neutral-700 text-white rounded transition-colors"
      >
        Clear Metrics
      </button>
    </div>
  );
}

export function PerformanceDashboardToggle() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-20 right-4 p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg hover:bg-neutral-800 transition-colors"
        title="Performance Dashboard"
      >
        <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>
      {isVisible && <PerformanceDashboard />}
    </>
  );
}
