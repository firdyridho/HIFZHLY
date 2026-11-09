import { type ReactNode } from 'react';

interface AuroraBackgroundProps {
  children?: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

export default function AuroraBackground({
  children,
  className = '',
  showRadialGradient = true,
}: AuroraBackgroundProps) {
  return (
    <div
      className={`relative overflow-hidden bg-white/60 transition-colors ${className}`}
    >
      {/* Ethereal Aurora Fluid Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* Orb 1: Emerald Dawn */}
        <div
          aria-hidden="true"
          className="absolute -top-[20%] -left-[10%] w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full bg-gradient-to-br from-emerald-300/25 via-emerald-400/15 to-transparent blur-[110px] sm:blur-[140px] animate-pulse"
          style={{ animationDuration: '8s' }}
        />

        {/* Orb 2: Celestial Sage / Mint */}
        <div
          aria-hidden="true"
          className="absolute top-[10%] -right-[15%] w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] rounded-full bg-gradient-to-bl from-teal-200/20 via-emerald-200/20 to-transparent blur-[120px] sm:blur-[150px] animate-pulse"
          style={{ animationDuration: '11s', animationDelay: '2s' }}
        />

        {/* Orb 3: Faint Gold Warmth (Nur Fajr) */}
        <div
          aria-hidden="true"
          className="absolute -top-[10%] left-[35%] w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full bg-gradient-to-b from-amber-200/15 via-emerald-100/10 to-transparent blur-[100px] sm:blur-[130px] animate-pulse"
          style={{ animationDuration: '9s', animationDelay: '4s' }}
        />

        {/* Optional Subtle Radial Gradient Mask */}
        {showRadialGradient && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_0%,rgba(248,250,252,0.7)_80%)]"
          />
        )}
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
