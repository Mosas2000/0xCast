interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizes[size]} relative`}>
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" role="img" aria-label="0xCast logo">
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#0a0a0a', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#111111', stopOpacity: 1 }} />
            </linearGradient>
            <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle cx="24" cy="24" r="23" fill="url(#bgGrad)" stroke="#1e293b" strokeWidth="1"/>
          <text x="8" y="30" fontFamily="SF Mono, Monaco, Consolas, monospace" fontSize="16" fontWeight="700" fill="url(#blueGlow)" filter="url(#glow)">0x</text>
          <path d="M32 32 L32 20 M32 20 L27 25 M32 20 L37 25" stroke="url(#blueGlow)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
          <ellipse cx="18" cy="14" rx="8" ry="4" fill="white" opacity="0.05"/>
        </svg>
      </div>
      <span className="font-bold text-xl tracking-tight">
        <span className="text-blue-500">0x</span>
        <span className="text-white">Cast</span>
      </span>
    </div>
  );
}
