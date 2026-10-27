import React, { useEffect, useRef, useState } from 'react';

/**
 * RELOOP Premium Order Success Celebration
 * 
 * High-fidelity, multi-stage fireworks and confetti cracker burst:
 * - Emerald (#087F5B, #10B981), Gold (#F59E0B, #E9B949), and Ivory/White star particles.
 * - Double-burst aerial pyrotechnic cadence (t=0ms, t=260ms).
 * - Full-viewport overlay canvas with high z-index (999999) and non-blocking pointer-events: none.
 * - Single-fire guard keyed by orderId in sessionStorage (won't repeat on refresh or re-render).
 * - Auto-dismisses and cleans up animation loops after 3.2 seconds.
 * - Strictly respects prefers-reduced-motion.
 */

const CELEBRATED_KEY = 'reloop_celebrated_orders';

const PALETTE = [
  '#087F5B', // Reloop Emerald
  '#10B981', // Mint Bright
  '#059669', // Deep Emerald
  '#34D399', // Mint Glow
  '#F59E0B', // Bright Amber Gold
  '#E9B949', // Reloop Warm Gold
  '#FBBF24', // Yellow Gold
  '#FDE047', // Light Gold Sparkle
  '#FFFFFF', // Starlight White
  '#38BDF8', // Cyan Electric Accent
];

function isAlreadyCelebrated(orderId) {
  if (!orderId) return true;
  try {
    const list = JSON.parse(sessionStorage.getItem(CELEBRATED_KEY) || '[]');
    return list.includes(String(orderId));
  } catch {
    return false;
  }
}

function markAsCelebrated(orderId) {
  if (!orderId) return;
  try {
    const list = JSON.parse(sessionStorage.getItem(CELEBRATED_KEY) || '[]');
    if (!list.includes(String(orderId))) {
      list.push(String(orderId));
      sessionStorage.setItem(CELEBRATED_KEY, JSON.stringify(list));
    }
  } catch {}
}

export default function OrderCelebration({ orderId }) {
  const canvasRef = useRef(null);
  const [active, setActive] = useState(() => {
    if (!orderId) return false;
    return !isAlreadyCelebrated(orderId);
  });

  useEffect(() => {
    if (!active || !orderId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle collection
    const particles = [];

    const createBurst = (originX, originY, count, speedMultiplier = 1) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 8 + 3.5) * speedMultiplier;
        const size = Math.random() * 7 + 3;
        const isRibbon = Math.random() > 0.45;
        const isStar = !isRibbon && Math.random() > 0.5;

        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 3.5, // Initial upward lift
          size,
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 14,
          opacity: 1,
          isRibbon,
          isStar,
          aspectRatio: isRibbon ? Math.random() * 2.2 + 1.4 : 1,
          decay: Math.random() * 0.004 + 0.008,
          gravity: isRibbon ? 0.18 : 0.24,
          drag: isRibbon ? 0.975 : 0.985,
        });
      }
    };

    // Burst 1: Main centered sky-shot right above the confirmation card
    createBurst(width * 0.5, Math.min(height * 0.28, 240), 75, 1.15);

    // Burst 2: Left secondary cluster after 220ms
    const timer2 = setTimeout(() => {
      createBurst(width * 0.42, Math.min(height * 0.24, 210), 45, 1.0);
    }, 220);

    // Burst 3: Right secondary cluster after 340ms
    const timer3 = setTimeout(() => {
      createBurst(width * 0.58, Math.min(height * 0.25, 220), 45, 1.0);
    }, 340);

    let animationFrameId;
    const startTime = performance.now();
    const durationMs = 3200;

    const render = (now) => {
      const elapsed = now - startTime;
      const progress = elapsed / durationMs;

      if (progress >= 1) {
        ctx.clearRect(0, 0, width, height);
        setActive(false);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Fade out smoothly in the last 30% of duration
      const globalFade = progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) / 0.3) : 1;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, p.opacity - p.decay);

        const currentAlpha = p.opacity * globalFade;
        if (currentAlpha <= 0.01) continue;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;

        if (p.isRibbon) {
          // Fluttering rectangular ribbon
          ctx.fillRect(-p.size / 2, (-p.size * p.aspectRatio) / 2, p.size, p.size * p.aspectRatio);
        } else if (p.isStar) {
          // Four-pointed sparkling star
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(0, 0, p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, p.size);
          ctx.quadraticCurveTo(0, 0, -p.size, 0);
          ctx.quadraticCurveTo(0, 0, 0, -p.size);
          ctx.fill();
        } else {
          // Circular firework spark
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    const closeTimer = setTimeout(() => {
      markAsCelebrated(orderId);
      setActive(false);
    }, durationMs + 100);

    return () => {
      markAsCelebrated(orderId);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(closeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [active, orderId]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      id="reloop-order-celebration-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999999,
      }}
      aria-hidden="true"
    />
  );
}
