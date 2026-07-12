import React, { useEffect, useRef } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  baseSpeedY: number;
  vx: number;
  vy: number;
  opacity: number;
  angle: number;
  angleSpeed: number;
}

export const BubblesBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let bubbles: Bubble[] = [];
    const bubbleCount = 60;
    const repulsionRadius = 120;
    const repulsionForce = 0.8;
    const friction = 0.95;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize bubbles
    const createBubbles = () => {
      bubbles = [];
      for (let i = 0; i < bubbleCount; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 5 + 2, // 2px to 7px size
          baseSpeedY: -(Math.random() * 0.4 + 0.2), // gentle float up
          vx: 0,
          vy: 0,
          opacity: Math.random() * 0.35 + 0.15,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: Math.random() * 0.02 - 0.01
        });
      }
    };
    createBubbles();

    // Event Listeners for Interaction
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Get primary color values from CSS
    const getPrimaryColor = () => {
      const computed = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      return computed || '239, 84%, 67%'; // default indigo
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const primaryHSL = getPrimaryColor();
      const mouse = mouseRef.current;

      bubbles.forEach(bubble => {
        // Natural float upward & sway
        bubble.angle += bubble.angleSpeed;
        const sway = Math.sin(bubble.angle) * 0.15;

        // Apply velocities
        bubble.x += bubble.vx + sway;
        bubble.y += bubble.vy + bubble.baseSpeedY;

        // Friction to decay extra velocities from push
        bubble.vx *= friction;
        bubble.vy *= friction;

        // Mouse interaction (repulsion)
        if (mouse.active) {
          const dx = bubble.x - mouse.x;
          const dy = bubble.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < repulsionRadius) {
            // Calculate force vector
            const force = (repulsionRadius - distance) / repulsionRadius;
            const angle = Math.atan2(dy, dx);

            // Push velocity
            bubble.vx += Math.cos(angle) * force * repulsionForce;
            bubble.vy += Math.sin(angle) * force * repulsionForce;
          }
        }

        // Screen boundary check (wrap around bottom with random x)
        if (bubble.y < -bubble.radius) {
          bubble.y = canvas.height + bubble.radius;
          bubble.x = Math.random() * canvas.width;
          bubble.vx = 0;
          bubble.vy = 0;
        }
        if (bubble.x < -bubble.radius) {
          bubble.x = canvas.width + bubble.radius;
        } else if (bubble.x > canvas.width + bubble.radius) {
          bubble.x = -bubble.radius;
        }

        // Draw bubble
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${primaryHSL}, ${bubble.opacity})`;
        ctx.fill();

        // Subtle bubble highlight/reflection
        ctx.beginPath();
        ctx.arc(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          bubble.radius * 0.2,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.5})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};
