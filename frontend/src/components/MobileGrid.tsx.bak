import { ReactNode } from 'react';

interface MobileGridProps {
  children: ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MobileGrid({
  children,
  columns = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = 'md',
  className = ''
}: MobileGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-5 lg:gap-6',
    lg: 'gap-6 sm:gap-8 lg:gap-10'
  };

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  };

  const getGridClass = () => {
    const classes = [];
    
    if (columns.xs) classes.push(gridCols[columns.xs]);
    if (columns.sm) classes.push(`sm:${gridCols[columns.sm]}`);
    if (columns.md) classes.push(`md:${gridCols[columns.md]}`);
    if (columns.lg) classes.push(`lg:${gridCols[columns.lg]}`);
    if (columns.xl) classes.push(`xl:${gridCols[columns.xl]}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`grid ${getGridClass()} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}
