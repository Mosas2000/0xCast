interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg
        className="animate-spin"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <LoadingSpinner size="lg" className="text-blue-500" />
      <p className="mt-4 text-zinc-500">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-4 w-8 rounded" />
      </div>
      <div className="skeleton h-6 w-full rounded mb-2" />
      <div className="skeleton h-6 w-3/4 rounded mb-4" />
      <div className="skeleton h-2 w-full rounded-full mb-4" />
      <div className="flex justify-between pt-4 border-t border-zinc-800">
        <div>
          <div className="skeleton h-3 w-16 rounded mb-1" />
          <div className="skeleton h-5 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}
