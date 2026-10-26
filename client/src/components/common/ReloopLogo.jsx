import React from 'react';
import { Link } from 'react-router-dom';

/**
 * RELOOP Original Brand Identity Component
 * 
 * Symbolism:
 * - The Mobius-inspired dual loop symbolizes infinite electronics renewal and circular economics.
 * - The precision node at the core represents technical diagnostics and verified device integrity.
 * - Typeset in geometric Manrope with architectural tracking.
 * 
 * @param {'dark'|'light'} variant - 'dark' for white/canvas surfaces, 'light' for midnight navy backgrounds
 * @param {boolean} showTagline - whether to display the brand subtext
 * @param {boolean} compact - if true, renders only the icon mark
 * @param {string} to - link destination, defaults to '/'
 * @param {number} scale - scaling factor (default 1)
 * @param {string} className - extra classes
 */
export default function ReloopLogo({
  variant = 'dark',
  showTagline = true,
  compact = false,
  to = '/',
  scale = 1,
  className = '',
}) {
  const isLight = variant === 'light';
  const textColor = isLight ? '#FAF9F6' : '#0B1220';
  const tagColor = isLight ? '#94A3B8' : '#687386';
  const emerald = '#087F5B';
  const emeraldAccent = '#099268';
  const trackColor = isLight ? 'rgba(255, 255, 255, 0.12)' : 'rgba(11, 18, 32, 0.08)';

  const logoMark = (
    <svg
      width="36"
      height="36"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 reloop-logo-mark"
      style={{ transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      aria-label="RELOOP circular renewal symbol"
    >
      <defs>
        <linearGradient id={`reloop-emerald-grad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#20C997" />
          <stop offset="100%" stopColor="#087F5B" />
        </linearGradient>
        <linearGradient id={`reloop-track-grad-${variant}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isLight ? '#FFFFFF' : '#0B1220'} stopOpacity="0.8" />
          <stop offset="100%" stopColor={isLight ? '#94A3B8' : '#687386'} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Subtle outer alignment ring */}
      <circle cx="50" cy="50" r="44" stroke={trackColor} strokeWidth="2" strokeDasharray="3 3" />

      {/* Primary Circular Renewal Flow Arc */}
      <path
        d="M 50 12 A 38 38 0 0 1 88 50 C 88 64 78 76 66 82"
        stroke={`url(#reloop-emerald-grad-${variant})`}
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Node pin 1 */}
      <circle cx="88" cy="50" r="4" fill={emeraldAccent} />

      {/* Counter Renewal Arc (Closed Loop Continuity) */}
      <path
        d="M 50 88 A 38 38 0 0 1 12 50 C 12 36 22 24 34 18"
        stroke={`url(#reloop-track-grad-${variant})`}
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Node pin 2 */}
      <circle cx="12" cy="50" r="4" fill={isLight ? '#FFFFFF' : '#0B1220'} />

      {/* Core Diagnostic & Renewal Hub */}
      <circle cx="50" cy="50" r="15" fill={isLight ? '#0F172A' : '#FFFFFF'} stroke={trackColor} strokeWidth="2" />
      <circle cx="50" cy="50" r="7.5" fill={emerald} />
    </svg>
  );

  if (compact) {
    if (to) {
      return (
        <Link to={to} className={`d-inline-flex align-items-center text-decoration-none ${className}`}>
          {logoMark}
        </Link>
      );
    }
    return logoMark;
  }

  const logoContent = (
    <div
      className={`d-inline-flex align-items-center gap-2 text-decoration-none user-select-none ${className}`}
      style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}
    >
      {logoMark}

      {/* Wordmark */}
      <div className="d-flex flex-column justify-content-center">
        <div className="d-flex align-items-baseline">
          <span
            style={{
              color: textColor,
              fontWeight: 800,
              fontSize: '1.42rem',
              letterSpacing: '-0.035em',
              lineHeight: 1,
              fontFamily: "'Manrope', 'Inter', sans-serif",
            }}
          >
            RE
          </span>
          <span
            style={{
              color: emerald,
              fontWeight: 800,
              fontSize: '1.42rem',
              letterSpacing: '-0.035em',
              lineHeight: 1,
              fontFamily: "'Manrope', 'Inter', sans-serif",
            }}
          >
            LOOP
          </span>
        </div>
        {showTagline && (
          <span
            style={{
              color: tagColor,
              fontSize: '0.62rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              lineHeight: 1.2,
              marginTop: '3px',
              textTransform: 'uppercase',
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            Quality renewed. Value restored.
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="text-decoration-none" title="RELOOP Storefront">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
