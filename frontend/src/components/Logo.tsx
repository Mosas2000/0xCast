interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'mark';
}

/**
 * 0xCast brand logo — hand-drawn sketch style with custom curves.
 * Renders as an inline SVG for crisp scaling at any size.
 */
export function Logo({ size = 48, className = '', variant = 'full' }: LogoProps) {
  if (variant === 'mark') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="0xCast logo"
      >
        {/* Background circle with subtle gradient */}
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="text-shine" x1="12" y1="16" x2="52" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logo-grad)" />
        {/* "0" character — sketched oval with slight tilt */}
        <path
          d="M20 32c0-7.5 2.8-13 6.5-13s6.5 5.5 6.5 13-2.8 13-6.5 13S20 39.5 20 32z"
          stroke="url(#text-shine)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          transform="rotate(-4 26.5 32)"
        />
        {/* "X" character — crossed strokes with hand-drawn curves */}
        <path
          d="M36 20c1.2 1.8 5.4 9.2 7.5 12.2-2.4 3.2-6.3 9.8-7.5 11.8"
          stroke="url(#text-shine)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M50 20c-1.2 1.8-5.4 9.2-7.5 12.2 2.4 3.2 6.3 9.8 7.5 11.8"
          stroke="url(#text-shine)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  // Full logo: mark + "Cast" wordmark
  const markSize = size;
  const fontSize = size * 0.55;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Logo size={markSize} variant="mark" />
      <span
        className="font-bold tracking-tight text-white"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1,
          fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
          letterSpacing: '-0.03em',
        }}
      >
        Cast
      </span>
    </div>
  );
}

export default Logo;
