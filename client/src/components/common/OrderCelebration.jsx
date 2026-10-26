import React, { useEffect, useRef, useState } from 'react';

/**
 * RELOOP Order Success Celebration
 * 
 * Lightweight, high-performance canvas particle burst:
 * - Restrained emerald, gold, and slate particles.
 * - Single-fire guard tied to confirmed checkout order ID.
 * - Non-blocking pointer-events: none overlay (receipt remains completely interactive).
 * - Self-terminating after ~2.8 seconds.
 * - Fully respects window.matchMedia('(prefers-reduced-motion: reduce)').
 */

const PALETTE = [
  '#087F5B', // Reloop Emerald
  '#20C997', // Mint Accent
  '#E9B949', // Gold Accent
  '#F59E0B', // Amber
  '#0B1220', // Navy Slate
  '#94A3B8', // Soft Slate
];

export default function OrderCelebration({ orderId }) {
  const canvasRef = useRef(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setActive(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate ~55 celebratory particles originating from top center
    const particleCount = 55;
    const originX = width / 2;
    const originY = Math.min(height * 0.28, 260);

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 9 + 4;
      const size = Math.random() * 6 + 3;
      const isRibbon = Math.random() > 0.5;

      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4, // Upward initial thrust
        size,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        isRibbon,
        aspectRatio: isRibbon ? Math.random() * 2 + 1.5 : 1,
      });
    }

    let animationFrameId;
    const startTime = performance.now();
    const durationMs = 2800;

    const render = (now) => {
      const elapsed = now - startTime;
      const progress = elapsed / durationMs;

      if (progress >= 1) {
        ctx.clearRect(0, 0, width, height);
        setActive(false);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Fade out over the final 35% of the animation
      const fadeProgress = progress > 0.65 ? (progress - 0.65) / 0.35 : 0;
      const globalAlpha = Math.max(0, 1 - fadeProgress);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply physical kinematics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // Gentle gravity
        p.vx *= 0.985; // Air resistance
        p.vy *= 0.985;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity * globalAlpha;
        ctx.fillStyle = p.color;

        if (p.isRibbon) {
          ctx.fillRect(-p.size / 2, (-p.size * p.aspectRatio) / 2, p.size, p.size * p.aspectRatio);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const timer = setTimeout(() => {
      setActive(false);
    }, durationMs + 100);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [orderId]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
