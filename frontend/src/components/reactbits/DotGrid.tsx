import { useRef, useEffect } from 'react';

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximityRadius?: number;
  shockwaveSpeed?: number;
  maxDisplacement?: number;
  className?: string;
}

interface Dot {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
}

export default function DotGrid({
  dotSize = 2,
  gap = 28,
  baseColor = 'rgba(16, 185, 129, 0.22)',
  activeColor = 'rgba(5, 150, 105, 0.95)',
  proximityRadius = 130,
  shockwaveSpeed = 4.5,
  maxDisplacement = 18,
  className = '',
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dots: Dot[] = [];
    const shockwaves: Shockwave[] = [];
    const mouse = { x: -1000, y: -1000, active: false };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Rebuild structured 2D dot grid
      dots = [];
      const cols = Math.floor(width / gap) + 2;
      const rows = Math.floor(height / gap) + 2;

      const startX = (width - (cols - 1) * gap) / 2;
      const startY = (height - (rows - 1) * gap) / 2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = startX + i * gap;
          const y = startY + j * gap;
          dots.push({
            x,
            y,
            originX: x,
            originY: y,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      shockwaves.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.max(canvas.clientWidth, canvas.clientHeight) * 0.45,
        strength: 22,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    const render = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      ctx.clearRect(0, 0, width, height);

      // Advance shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += shockwaveSpeed;
        sw.strength *= 0.96;

        if (sw.radius > sw.maxRadius || sw.strength < 0.2) {
          shockwaves.splice(s, 1);
        }
      }

      // Physics loop: spring restitution & pointer/shockwave influence
      const stiffness = 0.085;
      const damping = 0.82;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // 1. Proximity pointer repulsion
        let targetX = dot.originX;
        let targetY = dot.originY;

        if (mouse.active) {
          const dx = dot.originX - mouse.x;
          const dy = dot.originY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < proximityRadius && dist > 0) {
            const factor = (1 - dist / proximityRadius) * maxDisplacement;
            targetX += (dx / dist) * factor;
            targetY += (dy / dist) * factor;
          }
        }

        // 2. Click shockwave displacement
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const dx = dot.originX - sw.x;
          const dy = dot.originY - sw.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const diff = Math.abs(dist - sw.radius);

          if (diff < 40 && dist > 0) {
            const shockFactor = (1 - diff / 40) * sw.strength;
            targetX += (dx / dist) * shockFactor;
            targetY += (dy / dist) * shockFactor;
          }
        }

        // 3. Spring Euler integration
        const ax = (targetX - dot.x) * stiffness;
        const ay = (targetY - dot.y) * stiffness;

        dot.vx = (dot.vx + ax) * damping;
        dot.vy = (dot.vy + ay) * damping;

        dot.x += dot.vx;
        dot.y += dot.vy;

        // 4. Draw dot with dynamic proximity brightness
        const distToMouse = Math.sqrt(
          (dot.x - mouse.x) * (dot.x - mouse.x) + (dot.y - mouse.y) * (dot.y - mouse.y)
        );

        let currentDotSize = dotSize;
        if (distToMouse < proximityRadius) {
          const proximityRatio = 1 - distToMouse / proximityRadius;
          currentDotSize = dotSize + proximityRatio * 1.5;
          ctx.fillStyle = activeColor;
        } else {
          ctx.fillStyle = baseColor;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, currentDotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [dotSize, gap, baseColor, activeColor, proximityRadius, shockwaveSpeed, maxDisplacement]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    />
  );
}
