import { useRef, useState, type PointerEvent, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from 'react';
import { motion, useMotionValue, useTransform, useMotionTemplate } from 'framer-motion';

type SpotlightButtonProps<T extends ElementType = 'button'> = {
  as?: T;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export default function SpotlightButton<T extends ElementType = 'button'>({
  as,
  className = '',
  spotlightColor = 'rgba(16, 185, 129, 0.25)',
  borderColor = 'rgba(16, 185, 129, 0.4)',
  children,
  ...rest
}: SpotlightButtonProps<T>) {
  const Component = (as ? motion.create(as as any) : motion.button) as any;
  const buttonRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
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

  const spotlightBg = useMotionTemplate`radial-gradient(circle at ${xPercentage} ${yPercentage}, ${spotlightColor} 0%, transparent 65%)`;

  return (
    <Component
      ref={buttonRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300 ${className}`}
      style={{
        borderColor: isHovered ? borderColor : undefined,
      }}
      {...rest}
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
      {/* Content */}
      <div className="relative z-[1] w-full h-full flex items-center justify-center">
        {children}
      </div>
    </Component>
  );
}
