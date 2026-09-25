import React from 'react';

interface SafeChatLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  showTagline?: boolean;
  tagline?: string;
  variant?: 'dark' | 'light' | 'color';
}

/**
 * SafeChat Official Brand Logo
 * Concept: Shield + Chat Bubble + Protective Heart/Check
 * Represents safety, trust, and communication for family child-safety.
 * Minimal, modern, clean SVG.
 */
export const SafeChatLogo: React.FC<SafeChatLogoProps> = ({
  className = '',
  size = 36,
  showText = false,
  showTagline = false,
  tagline = 'Safe conversations. Safer families.',
  variant = 'color',
}) => {
  const isDark = variant === 'dark';
  const isLight = variant === 'light';

  // Gradient IDs to avoid collisions
  const gradId = `safechat-shield-grad-${size}`;
  const bubbleGradId = `safechat-bubble-grad-${size}`;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Shield + Chat SVG Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="SafeChat Shield & Chat Bubble Logo"
      >
        <defs>
          <linearGradient id={gradId} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            {isLight ? (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e2e8f0" />
              </>
            ) : isDark ? (
              <>
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="50%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#0f172a" />
              </>
            )}
          </linearGradient>

          <linearGradient id={bubbleGradId} x1="14" y1="12" x2="34" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>

          <filter id="subtle-glow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* Outer Shield Path */}
        <path
          d="M24 4L9 9.5V20.5C9 30.5 15.4 39.8 24 43.5C32.6 39.8 39 30.5 39 20.5V9.5L24 4Z"
          fill={`url(#${gradId})`}
          stroke={isLight ? '#cbd5e1' : '#4338ca'}
          strokeWidth="1.5"
          filter="url(#subtle-glow)"
        />

        {/* Subtle Shield Inner Rim */}
        <path
          d="M24 7.2L12 11.6V20.5C12 28.6 17.1 36.2 24 39.4C30.9 36.2 36 28.6 36 20.5V11.6L24 7.2Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.15)"
          strokeWidth="1"
        />

        {/* Chat / Speech Bubble (Centered inside Shield) */}
        <path
          d="M17 16C15.3431 16 14 17.3431 14 19V25C14 26.6569 15.3431 28 17 28H19V32L24 28H31C32.6569 28 34 26.6569 34 25V19C34 17.3431 32.6569 16 31 16H17Z"
          fill={`url(#${bubbleGradId})`}
        />

        {/* Inside Chat Bubble: Trust Checkmark & Communication Dots */}
        <path
          d="M20.5 22L23 24.5L28 19.5"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Text + Optional Tagline */}
      {(showText || showTagline) && (
        <div className="flex flex-col">
          {showText && (
            <span
              className={`text-lg font-bold tracking-tight ${
                isLight ? 'text-white' : 'text-slate-900'
              }`}
            >
              SafeChat
            </span>
          )}
          {showTagline && (
            <span
              className={`text-xs ${
                isLight ? 'text-slate-300' : 'text-slate-500 font-medium'
              }`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
