import { ReactNode } from 'react';

interface MobileSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  children?: ReactNode;
  loading?: boolean;
}

export function MobileSkeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  children,
  loading = true
}: MobileSkeletonProps) {
  if (!loading && children) {
    return <>{children}</>;
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'card':
        return 'rounded-xl';
      default:
        return 'rounded-lg';
    }
  };

  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '16px' : variant === 'circular' ? '40px' : '100px')
  };

  return (
    <div
      className={`
        bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800
        bg-[length:200%_100%]
        animate-[shimmer_1.5s_ease-in-out_infinite]
        ${getVariantClasses()}
        ${className}
      `}
      style={style}
    />
  );
}

export function MobileSkeletonCard() {
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <MobileSkeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <MobileSkeleton variant="text" width="60%" className="mb-2" />
          <MobileSkeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <MobileSkeleton variant="text" className="mb-2" />
      <MobileSkeleton variant="text" width="80%" className="mb-4" />
      <MobileSkeleton variant="rectangular" height={200} />
    </div>
  );
}

export function MobileSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <MobileSkeletonCard key={index} />
      ))}
    </div>
  );
}
