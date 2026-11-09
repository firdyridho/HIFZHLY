import { type ReactNode } from 'react';
import DotGrid from './DotGrid';

interface HeroBackgroundProps {
  children?: ReactNode;
  className?: string;
}

export default function HeroBackground({
  children,
  className = '',
}: HeroBackgroundProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-slate-50 ${className}`}>
      {/* 1. Symmetrical Ambient Spotlight at Top Center */}
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[400px] bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(16,185,129,0.14),transparent_75%)] pointer-events-none z-0"
      />

      {/* 2. Official React Bits Springy Jelly DotGrid with Click Shockwaves */}
      <div
        className="absolute inset-0 z-0 pointer-events-auto"
        style={{
          maskImage: 'radial-gradient(ellipse 85% 70% at 50% 35%, black 45%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 35%, black 45%, transparent 100%)',
        }}
      >
        <DotGrid
          gap={28}
          dotSize={2}
          baseColor="rgba(16, 185, 129, 0.18)"
          activeColor="rgba(5, 150, 105, 0.85)"
          proximityRadius={135}
          maxDisplacement={18}
          shockwaveSpeed={4.2}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full pointer-events-auto">{children}</div>
    </div>
  );
}
