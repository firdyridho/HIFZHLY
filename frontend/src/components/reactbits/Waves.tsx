import { useRef, useEffect } from 'react';

interface WavesProps {
  lineColor?: string;
  fillColor?: string;
  waveCount?: number;
  waveSpeed?: number;
  waveHeight?: number;
  className?: string;
}

export default function Waves({
  lineColor = 'rgba(16, 185, 129, 0.22)',
  fillColor = 'rgba(16, 185, 129, 0.03)',
  waveCount = 4,
  waveSpeed = 0.012,
  waveHeight = 32,
  className = '',
}: WavesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resizeCanvas();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      step += waveSpeed;

      const baseCenterY = height * 0.62;

      for (let i = 0; i < waveCount; i++) {
        const offset = i * (Math.PI / waveCount);
        const currentAmp = waveHeight * (1 - i * 0.15);

        ctx.beginPath();

        // Start point
        ctx.moveTo(0, height);
        ctx.lineTo(0, baseCenterY);

        for (let x = 0; x <= width; x += 8) {
          // Calculate distance to mouse for interactive ripple
          const dx = x - mouse.x;
          const dist = Math.abs(dx);
          const mouseInfluence = dist < 240 ? Math.cos((dist / 240) * (Math.PI / 2)) * 22 : 0;

          // Harmonic multi-frequency sine wave (representing Qur'anic recitation soundwaves)
          const y =
            baseCenterY +
            Math.sin(x * 0.0035 + step + offset) * currentAmp +
            Math.cos(x * 0.007 - step * 0.6 + offset) * (currentAmp * 0.45) -
            mouseInfluence;

          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Fill under the lowest wave for soft volumetric depth
        if (i === 0 && fillColor) {
          const fillGradient = ctx.createLinearGradient(0, baseCenterY - waveHeight, 0, height);
          fillGradient.addColorStop(0, fillColor);
          fillGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = fillGradient;
          ctx.fill();
        }

        // Wave stroke
        const strokeAlpha = 0.18 - i * 0.035;
        ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/g, `${Math.max(strokeAlpha, 0.05)})`);
        ctx.lineWidth = i === 1 ? 1.75 : 1.2;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [lineColor, fillColor, waveCount, waveSpeed, waveHeight]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
    />
  );
}

