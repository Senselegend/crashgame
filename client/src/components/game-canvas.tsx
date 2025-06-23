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

      // Draw multiplier curve
      if (gameState.isPlaying && gameState.startTime) {
        const elapsed = Date.now() - gameState.startTime;
        const progress = Math.min(elapsed / 8000, 1); // 8 seconds max for smooth animation
        
        // Draw exponential curve from bottom-left to current position
        const startX = 60;
        const startY = rect.height - 60;
        const endX = startX + progress * (rect.width - 140);
        
        // Calculate curve points using exponential formula with smoother interpolation
        const points: { x: number; y: number }[] = [];
        const steps = Math.max(50, Math.floor(progress * 150)); // More points for smoother curve
        
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const x = startX + t * progress * (rect.width - 140);
          
          // Use actual game multiplier calculation for accuracy
          const timeMs = t * progress * 8000;
          const multiplierAtTime = Math.pow(Math.E, 0.0001 * timeMs) * (1 - 0.03);
          const clampedMultiplier = Math.max(1.0, Math.min(50, multiplierAtTime));
          
          // Smoother Y calculation using logarithmic scale
          const normalizedMultiplier = Math.log(clampedMultiplier) / Math.log(10);
          const y = startY - (normalizedMultiplier * (rect.height - 120));
          
          points.push({ x, y: Math.max(40, Math.min(rect.height - 60, y)) });
        }

        // Store points for fade out animation
        pathPointsRef.current = points;

        // Draw the exponential curve
        if (points.length > 1) {
          // Draw gradient background under curve
          const gradient = ctx.createLinearGradient(0, startY, 0, 40);
          gradient.addColorStop(0, 'rgba(0, 217, 255, 0.1)');
          gradient.addColorStop(1, 'rgba(0, 217, 255, 0.3)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          points.forEach((point, index) => {
            if (index === 0) {
              ctx.lineTo(point.x, point.y);
            } else {
              const prev = points[index - 1];
              const controlX = (prev.x + point.x) / 2;
              const controlY = (prev.y + point.y) / 2;
              ctx.quadraticCurveTo(prev.x, prev.y, controlX, controlY);
            }
          });
          ctx.lineTo(endX, startY);
          ctx.closePath();
          ctx.fill();
          
          // Draw the main curve line
          ctx.strokeStyle = '#00D9FF';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          
          points.forEach((point, index) => {
            if (index === 0) {
              ctx.lineTo(point.x, point.y);
            } else {
              const prev = points[index - 1];
              const controlX = (prev.x + point.x) / 2;
              const controlY = (prev.y + point.y) / 2;
              ctx.quadraticCurveTo(prev.x, prev.y, controlX, controlY);
            }
          });
          
          ctx.stroke();
          
          // Add glow effect
          ctx.shadowColor = '#00D9FF';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Calculate spaceship position on the curve
        if (points.length > 0) {
          const currentPoint = points[points.length - 1];
          
          // Draw current multiplier point
          ctx.fillStyle = '#00D9FF';
          ctx.beginPath();
          ctx.arc(currentPoint.x, currentPoint.y, 6, 0, 2 * Math.PI);
          ctx.fill();
          
          // Add pulsing glow
          ctx.shadowColor = '#00D9FF';
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Store position for spaceship (ensure it matches exactly)
          window.rocketPosition = { x: currentPoint.x, y: currentPoint.y };
        } else {
          // If no points yet, start at the beginning
          window.rocketPosition = { x: startX, y: startY };
        }
      }

      // Handle fade out animation when game ends
      if (!gameState.isPlaying && pathPointsRef.current.length > 0) {
        const fadeStartTime = window.fadeStartTime || Date.now();
        if (!window.fadeStartTime) window.fadeStartTime = fadeStartTime;
        
        const fadeElapsed = Date.now() - fadeStartTime;
        const fadeDuration = 1500; // 1.5 seconds fade
        const fadeProgress = Math.min(fadeElapsed / fadeDuration, 1);
        const opacity = 1 - fadeProgress;
        
        if (opacity > 0) {
          const points = pathPointsRef.current;
          const startX = 60;
          const startY = rect.height - 60;
          const endX = points[points.length - 1]?.x || startX;
          
          // Draw fading gradient background
          const gradient = ctx.createLinearGradient(0, startY, 0, 40);
          gradient.addColorStop(0, `rgba(0, 217, 255, ${0.1 * opacity})`);
          gradient.addColorStop(1, `rgba(0, 217, 255, ${0.3 * opacity})`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          points.forEach((point, index) => {
            if (index === 0) {
              ctx.lineTo(point.x, point.y);
            } else {
              const prev = points[index - 1];
              const controlX = (prev.x + point.x) / 2;
              const controlY = (prev.y + point.y) / 2;
              ctx.quadraticCurveTo(prev.x, prev.y, controlX, controlY);
            }
          });
          ctx.lineTo(endX, startY);
          ctx.closePath();
          ctx.fill();
          
          // Draw fading curve line
          ctx.strokeStyle = `rgba(0, 217, 255, ${opacity})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          
          points.forEach((point, index) => {
            if (index === 0) {
              ctx.lineTo(point.x, point.y);
            } else {
              const prev = points[index - 1];
              const controlX = (prev.x + point.x) / 2;
              const controlY = (prev.y + point.y) / 2;
              ctx.quadraticCurveTo(prev.x, prev.y, controlX, controlY);
            }
          });
          
          ctx.stroke();
          
          // Continue fade animation
          animationRef.current = requestAnimationFrame(draw);
        } else {
          // Fade complete, clear everything
          pathPointsRef.current = [];
          window.fadeStartTime = undefined;
        }
      }

      // Draw static starting point when not playing and fade is complete
      if (!gameState.isPlaying && pathPointsRef.current.length === 0) {
        const startX = 60;
        const startY = rect.height - 60;
        
        ctx.fillStyle = '#00D9FF';
        ctx.beginPath();
        ctx.arc(startX, startY, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Store starting position for UFO
        window.rocketPosition = { x: startX, y: startY };
      }

      if (gameState.isPlaying) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    // Start animation when game is playing OR when fading out
    if (gameState.isPlaying || (!gameState.isPlaying && pathPointsRef.current.length > 0)) {
      draw();
    } else if (!gameState.isPlaying) {
      // Reset fade when starting fresh
      window.fadeStartTime = undefined;
      // Draw one frame to show starting point
      draw();
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
