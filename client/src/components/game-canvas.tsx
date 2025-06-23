import { useEffect, useRef } from 'react';
import { GameState } from '@shared/schema';

interface GameCanvasProps {
  gameState: GameState;
  className?: string;
}

export function GameCanvas({ gameState, className }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const pathPointsRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let i = 0; i < rect.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, rect.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let i = 0; i < rect.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(rect.width, i);
        ctx.stroke();
      }

      // Draw multiplier curve if game is playing
      if (gameState.isPlaying && gameState.startTime) {
        const elapsed = Date.now() - gameState.startTime;
        
        // Calculate current point
        const currentX = Math.min((elapsed / 15000) * rect.width, rect.width - 50);
        const currentY = Math.max(rect.height - (gameState.currentMultiplier - 1) * 30, 50);
        
        // Add current point to path
        pathPointsRef.current.push({ x: currentX, y: currentY });
        
        // Keep only recent points to prevent memory issues
        if (pathPointsRef.current.length > 200) {
          pathPointsRef.current = pathPointsRef.current.slice(-200);
        }

        // Draw the curve
        if (pathPointsRef.current.length > 1) {
          ctx.strokeStyle = '#00D9FF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          
          pathPointsRef.current.forEach((point, index) => {
            if (index === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          });
          
          ctx.stroke();
          
          // Add glow effect
          ctx.shadowColor = '#00D9FF';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw current multiplier point
        ctx.fillStyle = '#00D9FF';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add glow to the point
        ctx.shadowColor = '#00D9FF';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (gameState.isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (gameState.isPlaying) {
      // Reset path when starting new game
      if (pathPointsRef.current.length === 0) {
        pathPointsRef.current = [];
      }
      draw();
    } else {
      // Clear path when game ends
      pathPointsRef.current = [];
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.currentMultiplier, gameState.startTime]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full bg-gradient-to-t from-game-dark/50 to-transparent ${className}`}
    />
  );
}
