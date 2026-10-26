import React, { useRef, useEffect } from 'react';

/**
 * Devologics Signature Strip with Responsive Dotted-Trail Cursor Interaction
 * 
 * Requirements Met:
 * 1. Exact Credit: "Designed & Developed by Devologics"
 * 2. Required Copyright: "© 2026 RELOOP. All rights reserved."
 * 3. Scoped Canvas Interaction: Smooth, restrained dotted-trail following mouse movement.
 * 4. Fades and settles gracefully without particle explosion or CPU drain.
 * 5. Strictly disabled on touch devices and respects prefers-reduced-motion.
 * 6. Non-blocking (pointer-events: none on canvas, pointer-events: auto on content links).
 * 7. Full event cleanup on unmount.
 */
export default function DevologicsSignature() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // 1. Accessibility & Device Detection
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (prefersReducedMotion || isTouchDevice) {
      return; // Keep clean static presentation
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = container.offsetWidth);
    let height = (canvas.height = container.offsetHeight);

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.offsetWidth;
      height = canvas.height = container.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool for restrained dotted trail
    const DOT_COUNT = 14;
    const dots = Array.from({ length: DOT_COUNT }, (_, i) => ({
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      targetX: width / 2,
      targetY: height / 2,
      size: Math.max(1.5, 3.5 - (i / DOT_COUNT) * 2), // Tapering dot sizes
      alpha: 0,
      color: i % 2 === 0 ? '#087F5B' : '#20C997', // Emerald theme accents
    }));

    let mouseActive = false;
    let lastMoveTime = Date.now();
    let mousePos = { x: width / 2, y: height / 2 };

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
      mouseActive = true;
      lastMoveTime = Date.now();
    };

    const handlePointerLeave = () => {
      mouseActive = false;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      const idleTime = now - lastMoveTime;

      // Update lead dot towards mouse
      let leaderX = mousePos.x;
      let leaderY = mousePos.y;

      for (let i = 0; i < DOT_COUNT; i++) {
        const dot = dots[i];

        if (i === 0) {
          dot.targetX = leaderX;
          dot.targetY = leaderY;
        } else {
          // Smooth trailing physics lerping to previous dot
          const prev = dots[i - 1];
          dot.targetX = prev.x;
          dot.targetY = prev.y;
        }

        // Spring / ease towards target
        dot.x += (dot.targetX - dot.x) * 0.28;
        dot.y += (dot.targetY - dot.y) * 0.28;

        // Fade in when mouse active in container, fade out gracefully when idle
        if (mouseActive) {
          dot.alpha = Math.min(0.85, dot.alpha + 0.05);
        } else {
          dot.alpha = Math.max(0, dot.alpha - 0.03);
        }

        // Draw dot if visible
        if (dot.alpha > 0.01) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
          ctx.fillStyle = dot.color;
          ctx.globalAlpha = dot.alpha * (1 - i / (DOT_COUNT * 1.2)); // Softer tail
          ctx.fill();

          // Connect with ultra-subtle connecting line to previous dot
          if (i > 0 && dots[i - 1].alpha > 0.01) {
            ctx.beginPath();
            ctx.moveTo(dots[i - 1].x, dots[i - 1].y);
            ctx.lineTo(dot.x, dot.y);
            ctx.strokeStyle = '#087F5B';
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = dot.alpha * 0.2;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="devologics-signature-strip"
      aria-label="Creator attribution and copyright"
    >
      {/* Interactive canvas layer (strictly non-blocking) */}
      <canvas ref={canvasRef} className="devologics-canvas" aria-hidden="true" />

      {/* Structured Content Layer */}
      <div className="container-xl devologics-content">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-center text-md-start">
          {/* Copyright notice */}
          <div className="text-secondary small user-select-none" style={{ fontSize: '0.84rem' }}>
            <span>© 2026 RELOOP. All rights reserved.</span>
            <span className="d-none d-sm-inline mx-2 text-muted">·</span>
            <span className="d-block d-sm-inline mt-1 mt-sm-0 text-muted" style={{ fontSize: '0.78rem' }}>
              Academic Full Stack Assessment · Certified Electronics Platform
            </span>
          </div>

          {/* Dedicated Devologics Attribution Badge */}
          <div className="d-flex align-items-center">
            <div className="devologics-badge user-select-none" title="Engineered by Devologics">
              <span className="devologics-pulse-dot" aria-hidden="true" />
              <span style={{ color: '#E2E8F0', fontWeight: 600 }}>Designed & Developed by Devologics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
