import { useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useMotionTemplate } from 'framer-motion';

export interface ElegantCtaProps {
  to?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'emerald' | 'secondary' | 'gold';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ElegantCta({
  to,
  onClick,
  children,
  variant = 'emerald',
  className = '',
  size = 'md',
}: ElegantCtaProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const bounds = buttonRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const x = (e.clientX - bounds.left) / bounds.width;
    const y = (e.clientY - bounds.top) / bounds.height;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handlePointerEnter = () => setIsHovered(true);
  const handlePointerLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const xPercentage = useTransform(mouseX, (v) => `${v * 100}%`);
  const yPercentage = useTransform(mouseY, (v) => `${v * 100}%`);

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-6 py-3.5 text-sm sm:text-[15px] rounded-2xl',
    lg: 'px-8 py-4 text-sm sm:text-base rounded-2xl',
  }[size];

  // Primary Emerald: React Bits Star Border + Shimmer Sweep + Cursor Spotlight
  if (variant === 'emerald') {
    const spotlightBg = useMotionTemplate`radial-gradient(circle at ${xPercentage} ${yPercentage}, rgba(52, 211, 153, 0.35) 0%, transparent 65%)`;

    const content = (
      <div
        ref={buttonRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={`relative inline-flex items-center justify-center p-[1.5px] overflow-hidden rounded-2xl group transition-all duration-300 active:scale-[0.98] shadow-md shadow-emerald-950/20 hover:shadow-lg hover:shadow-emerald-900/30 ${className}`}
      >
        {/* React Bits Traveling Star Light (Top & Bottom beams) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute w-[300%] h-[70%] opacity-85 bottom-[-14px] right-[-250%] rounded-full animate-star-bottom z-0"
          style={{
            background: 'radial-gradient(circle, #34d399, #10b981 30%, transparent 15%)',
            animationDuration: '4s',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute w-[300%] h-[70%] opacity-85 top-[-14px] left-[-250%] rounded-full animate-star-top z-0"
          style={{
            background: 'radial-gradient(circle, #6ee7b7, #059669 30%, transparent 15%)',
            animationDuration: '4s',
          }}
        />

        {/* Inner Emerald Core */}
        <div
          className={`relative z-[1] w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white font-bold tracking-wide transition-all duration-300 group-hover:from-emerald-700 group-hover:via-emerald-600 group-hover:to-emerald-800 border border-emerald-400/20 ${sizeClasses}`}
        >
          {/* Reactive Cursor Spotlight */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
            style={{
              background: spotlightBg,
              opacity: isHovered ? 1 : 0,
            }}
          />

          {/* Smooth Shimmer Sweep Bar */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-shimmer-slide pointer-events-none" />
          </div>

          {/* Text Content strictly without any icons */}
          <span className="relative z-10 text-center select-none drop-shadow-xs">
            {children}
          </span>
        </div>
      </div>
    );

    return to ? (
      <Link to={to} className="inline-block w-full sm:w-auto">
        {content}
      </Link>
    ) : (
      <button type="button" onClick={onClick} className="inline-block w-full sm:w-auto cursor-pointer">
        {content}
      </button>
    );
  }

  // Secondary Pearl: Crisp Scholarly White with Reactive Mouse Spotlight
  if (variant === 'secondary') {
    const spotlightBg = useMotionTemplate`radial-gradient(circle at ${xPercentage} ${yPercentage}, rgba(16, 185, 129, 0.16) 0%, transparent 60%)`;

    const content = (
      <div
        ref={buttonRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={`relative inline-flex items-center justify-center overflow-hidden border border-slate-200/90 hover:border-emerald-500/40 bg-white/95 backdrop-blur-md text-slate-800 hover:text-emerald-950 font-bold tracking-wide shadow-xs hover:shadow-md transition-all duration-300 active:scale-[0.98] group ${sizeClasses} ${className}`}
      >
        {/* Dynamic Cursor Spotlight */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: spotlightBg,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Ambient subtle glow ring on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border border-emerald-500/0 group-hover:border-emerald-500/25 transition-colors duration-300 rounded-[inherit]"
        />

        {/* Text Content strictly without any icons */}
        <span className="relative z-10 text-center select-none">
          {children}
        </span>
      </div>
    );

    return to ? (
      <Link to={to} className="inline-block w-full sm:w-auto">
        {content}
      </Link>
    ) : (
      <button type="button" onClick={onClick} className="inline-block w-full sm:w-auto cursor-pointer">
        {content}
      </button>
    );
  }

  // Special Gold/Ivory: Radiant Gold & Emerald Star Border on Deep Card
  const spotlightBg = useMotionTemplate`radial-gradient(circle at ${xPercentage} ${yPercentage}, rgba(245, 158, 11, 0.25) 0%, transparent 65%)`;

  const content = (
    <div
      ref={buttonRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative inline-flex items-center justify-center p-[1.5px] overflow-hidden rounded-2xl group transition-all duration-300 active:scale-[0.98] shadow-lg shadow-emerald-950/30 hover:shadow-xl hover:shadow-amber-500/20 ${className}`}
    >
      {/* Radiant Gold & Emerald Star Lights */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute w-[300%] h-[70%] opacity-90 bottom-[-14px] right-[-250%] rounded-full animate-star-bottom z-0"
        style={{
          background: 'radial-gradient(circle, #f59e0b, #fbbf24 30%, transparent 15%)',
          animationDuration: '3.6s',
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute w-[300%] h-[70%] opacity-90 top-[-14px] left-[-250%] rounded-full animate-star-top z-0"
        style={{
          background: 'radial-gradient(circle, #10b981, #34d399 30%, transparent 15%)',
          animationDuration: '3.6s',
        }}
      />

      {/* High-contrast Crisp Surface */}
      <div
        className={`relative z-[1] w-full h-full flex items-center justify-center bg-white hover:bg-emerald-50/90 text-emerald-950 font-extrabold tracking-wide transition-all duration-300 border border-amber-300/40 ${sizeClasses}`}
      >
        {/* Reactive Gold Spotlight */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: spotlightBg,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Shimmer sweep bar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent animate-shimmer-slide pointer-events-none" />
        </div>

        {/* Text Content strictly without any icons */}
        <span className="relative z-10 text-center select-none text-emerald-950">
          {children}
        </span>
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="inline-block w-full sm:w-auto">
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className="inline-block w-full sm:w-auto cursor-pointer">
      {content}
    </button>
  );
}
