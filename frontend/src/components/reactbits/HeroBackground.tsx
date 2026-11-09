import { type ReactNode } from 'react';
import Particles from './Particles';

interface HeroBackgroundProps {
  children?: ReactNode;
  className?: string;
}

export default function HeroBackground({
  children,
  className = '',
}: HeroBackgroundProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-slate-50 ${className}`}>
      {/* 1. Symmetrical Symmetrical Divine Spotlight Beam at Top Center */}
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] sm:w-[960px] h-[420px] bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(16,185,129,0.15),transparent_75%)] pointer-events-none z-0"
      />

      {/* 2. Symmetrical Architectural Blueprint Grid with Soft Circular Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-60 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16, 185, 129, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.07) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 80% 65% at 50% 35%, black 25%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 65% at 50% 35%, black 25%, transparent 85%)',
        }}
      />

      {/* 3. React Bits Interactive Floating Light Particles (Gentle Celestial Constellation) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles
          particleCount={35}
          particleColor="rgba(16, 185, 129, 0.45)"
          particleSize={2.2}
          speed={0.25}
          connectParticles={true}
          connectionColor="rgba(16, 185, 129, 0.09)"
          maxDistance={115}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
