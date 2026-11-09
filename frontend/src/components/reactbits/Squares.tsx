import { useRef, useEffect } from 'react';

interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  className?: string;
}

export default function Squares({
  direction = 'diagonal',
  speed = 0.35,
  borderColor = 'rgba(16, 185, 129, 0.09)',
  squareSize = 44,
  hoverFillColor = 'rgba(16, 185, 129, 0.12)',
  className = '',
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const gridOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoveredSquare = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resizeCanvas();

    const draw = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize);
          const squareY = y - (gridOffset.current.y % squareSize);

          // Check if current cell is hovered
          if (
            hoveredSquare.current &&
            Math.floor((x - startX) / squareSize) === hoveredSquare.current.x &&
            Math.floor((y - startY) / squareSize) === hoveredSquare.current.y
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(squareX, squareY, squareSize, squareSize);
          }

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(squareX, squareY, squareSize, squareSize);
        }
      }

      // Smooth vertical bottom mask gradient (fading canvas cleanly to transparent bottom)
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.45, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(1, 'rgba(248, 250, 252, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height * 0.45, canvas.width, canvas.height * 0.55);

      // Advance scrolling grid offset
      switch (direction) {
        case 'right':
          gridOffset.current.x -= speed;
          break;
        case 'left':
          gridOffset.current.x += speed;
          break;
        case 'down':
          gridOffset.current.y -= speed;
          break;
        case 'up':
          gridOffset.current.y += speed;
          break;
        case 'diagonal':
          gridOffset.current.x -= speed;
          gridOffset.current.y -= speed;
          break;
        default:
          break;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (mouseX < 0 || mouseX > rect.width || mouseY < 0 || mouseY > rect.height) {
        hoveredSquare.current = null;
        return;
      }

      const hoveredX = Math.floor((mouseX + (gridOffset.current.x % squareSize)) / squareSize);
      const hoveredY = Math.floor((mouseY + (gridOffset.current.y % squareSize)) / squareSize);

      hoveredSquare.current = { x: hoveredX, y: hoveredY };
    };

    const handleMouseLeave = () => {
      hoveredSquare.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    animationFrameId = requestAnimationFrame(draw);
    requestRef.current = animationFrameId;

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto select-none ${className}`}
    />
  );
}
