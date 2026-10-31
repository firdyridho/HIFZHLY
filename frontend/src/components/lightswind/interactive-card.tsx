import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "@/components/lib/utils";

export interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  InteractiveColor?: string;
  borderRadius?: string;
  rotationFactor?: number;
  transitionDuration?: number;
  transitionEasing?: string;
  tailwindBgClass?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
}

export const InteractiveCard = ({
  children,
  className,
  InteractiveColor = "rgba(16, 185, 129, 0.22)",
  borderRadius = "24px",
  rotationFactor = 0.35,
  transitionDuration = 0.25,
  transitionEasing = "easeOut",
  tailwindBgClass = "bg-white/95 backdrop-blur-sm",
  containerClassName,
  style,
}: InteractiveCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateXTrans = useTransform(y, [0, 1], [rotationFactor * 10, -rotationFactor * 10]);
  const rotateYTrans = useTransform(x, [0, 1], [-rotationFactor * 10, rotationFactor * 10]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const bounds = cardRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const px = (e.clientX - bounds.left) / bounds.width;
    const py = (e.clientY - bounds.top) / bounds.height;

    x.set(px);
    y.set(py);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  const xPercentage = useTransform(x, (val) => `${val * 100}%`);
  const yPercentage = useTransform(y, (val) => `${val * 100}%`);

  const interactiveBackground = useMotionTemplate`radial-gradient(circle at ${xPercentage} ${yPercentage}, ${InteractiveColor} 0%, transparent 70%)`;

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={handlePointerLeave}
      style={{
        perspective: 1000,
        borderRadius,
        ...style,
      }}
      className={cn("relative isolate w-full transition-shadow duration-300", containerClassName)}
    >
      <motion.div
        style={{
          rotateX: rotateXTrans,
          rotateY: rotateYTrans,
          transformStyle: "preserve-3d",
          transition: `transform ${transitionDuration}s ${transitionEasing}`,
        }}
        className="w-full h-full rounded-[inherit] overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/40"
      >
        {/* Background Interactive Radial Glow */}
        <motion.div
          className="absolute inset-0 rounded-[inherit] z-0 pointer-events-none"
          style={{
            background: interactiveBackground,
            transition: `opacity ${transitionDuration}s ${transitionEasing}`,
            opacity: isHovered ? 0.75 : 0,
          }}
        />

        {/* Content Container */}
        <div
          className={cn(
            "relative z-10 w-full h-full text-slate-800",
            tailwindBgClass,
            className
          )}
          style={{
            borderRadius,
          }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

