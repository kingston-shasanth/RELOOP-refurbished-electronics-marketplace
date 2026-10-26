import React from 'react';

/**
 * ConditionBadge Component
 * Standardized badge for Pristine/Like New, Excellent, Good, and Fair tiers.
 */
export default function ConditionBadge({ grade, showDot = true, className = '' }) {
  const normalized = (grade || '').toLowerCase().trim();

  let gradeClass = 'like-new';
  let label = grade || 'Like New';

  if (normalized.includes('pristine') || normalized.includes('like new')) {
    gradeClass = 'like-new';
    label = 'Like New';
  } else if (normalized.includes('excellent')) {
    gradeClass = 'excellent';
    label = 'Excellent';
  } else if (normalized.includes('good')) {
    gradeClass = 'good';
    label = 'Good';
  } else if (normalized.includes('fair')) {
    gradeClass = 'fair';
    label = 'Fair';
  }

  return (
    <span className={`grade-pill ${gradeClass} ${className}`}>
      {showDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            display: 'inline-block',
          }}
        />
      )}
      {label}
    </span>
  );
}
