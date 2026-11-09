import { type ReactNode } from 'react';
import Waves from './Waves';

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
      {/* 1. Subtle Architectural Micro-Dot Grid with Soft Radial Mask */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-50 z-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(16, 185, 129, 0.16) 1.2px, transparent 1.2px)',
          backgroundSize: '30px 30px',
          maskImage: 'radial-gradient(ellipse 85% 65% at 50% 30%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 65% at 50% 30%, black 40%, transparent 95%)',
        }}
      />

      {/* 2. Soft Ambient Divine Light Beam at Top Center */}
      <div
        aria-hidden="true"
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[650px] sm:w-[900px] h-[340px] bg-gradient-to-b from-emerald-200/25 via-emerald-100/10 to-transparent rounded-full blur-3xl pointer-events-none z-0"
      />

      {/* 3. React Bits Harmonic Audio Waves (Tilawah Soundwaves) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Waves
          lineColor="rgba(16, 185, 129, 0.24)"
          fillColor="rgba(16, 185, 129, 0.025)"
          waveCount={4}
          waveSpeed={0.01}
          waveHeight={28}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
