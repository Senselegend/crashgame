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
        const progress = Math.min(elapsed / 10000, 1); // 10 seconds max flight time
        
        // Calculate position based on exponential curve
        const currentX = 50 + progress * (rect.width - 100);
        const multiplierNormalized = Math.log(gameState.currentMultiplier) / Math.log(50); // Normalize to 0-1
        const currentY = rect.height - 50 - (multiplierNormalized * (rect.height - 100));
        
        // Add current point to path
        pathPointsRef.current.push({ x: currentX, y: currentY });
        
        // Keep only recent points to prevent memory issues
        if (pathPointsRef.current.length > 150) {
          pathPointsRef.current = pathPointsRef.current.slice(-150);
        }

        // Draw the curve with smooth bezier curves
        if (pathPointsRef.current.length > 2) {
          ctx.strokeStyle = '#00D9FF';
          ctx.lineWidth = 4;
          ctx.beginPath();
          
          // Start from first point
          ctx.moveTo(pathPointsRef.current[0].x, pathPointsRef.current[0].y);
          
          // Draw smooth curve through all points
          for (let i = 1; i < pathPointsRef.current.length - 1; i++) {
            const current = pathPointsRef.current[i];
            const next = pathPointsRef.current[i + 1];
            const controlX = (current.x + next.x) / 2;
            const controlY = (current.y + next.y) / 2;
            ctx.quadraticCurveTo(current.x, current.y, controlX, controlY);
          }
          
          // Draw to the last point
          if (pathPointsRef.current.length > 1) {
            const last = pathPointsRef.current[pathPointsRef.current.length - 1];
            ctx.lineTo(last.x, last.y);
          }
          
          ctx.stroke();
          
          // Add glow effect
          ctx.shadowColor = '#00D9FF';
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Draw current multiplier point (larger and more visible)
        ctx.fillStyle = '#00D9FF';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add pulsing glow to the point
        ctx.shadowColor = '#00D9FF';
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Store current position for rocket
        if (gameState.isPlaying) {
          window.rocketPosition = { x: currentX, y: currentY };
        }
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
