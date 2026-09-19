"use client";

import type { NeuralSide } from "@/lib/types";

type FlyAvatarProps = {
  side: NeuralSide;
  motion: boolean;
  intensity?: number;
};

export function FlyAvatar({ side, motion, intensity = 0 }: FlyAvatarProps) {
  const glow = Math.min(1, Math.max(0.15, intensity));
  const eye = side === "SELL" ? "#ff4b78" : side === "BUY" ? "#bdff32" : "#ff2d4a";

  return (
    <svg
      className="fly-svg"
      viewBox="0 0 260 180"
      role="img"
      aria-label="Avatar decorativo de mosca"
    >
      <defs>
        <radialGradient id="wingGlass" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#e8f2ff" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#8aa0c0" stopOpacity="0.08" />
        </radialGradient>
        <radialGradient id="thorax" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#f4f5f0" />
          <stop offset="100%" stopColor="#b8bcc4" />
        </radialGradient>
        <filter id="soft">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>

      <g className="fly-body">
        <g className="wing-l">
          <ellipse
            cx="78"
            cy="62"
            rx="62"
            ry="22"
            fill="url(#wingGlass)"
            stroke="#d7deea"
            strokeWidth="1.2"
            transform="rotate(-18 78 62)"
          />
          <path
            d="M40 54 C58 48 86 52 104 66"
            fill="none"
            stroke="#c9d4e4"
            strokeWidth="0.7"
            opacity="0.7"
          />
        </g>
        <g className="wing-r">
          <ellipse
            cx="182"
            cy="62"
            rx="62"
            ry="22"
            fill="url(#wingGlass)"
            stroke="#d7deea"
            strokeWidth="1.2"
            transform="rotate(18 182 62)"
          />
          <path
            d="M220 54 C202 48 174 52 156 66"
            fill="none"
            stroke="#c9d4e4"
            strokeWidth="0.7"
            opacity="0.7"
          />
        </g>

        <path d="M86 128 L74 156" stroke="#d8dbe2" strokeWidth="2.2" />
        <path d="M100 132 L92 160" stroke="#d8dbe2" strokeWidth="2.2" />
        <path d="M114 134 L110 164" stroke="#d8dbe2" strokeWidth="2.2" />
        <path d="M174 128 L186 156" stroke="#d8dbe2" strokeWidth="2.2" />
        <path d="M160 132 L168 160" stroke="#d8dbe2" strokeWidth="2.2" />
        <path d="M146 134 L150 164" stroke="#d8dbe2" strokeWidth="2.2" />
        <circle cx="74" cy="156" r="3.2" fill="#e8eaef" />
        <circle cx="92" cy="160" r="3.2" fill="#e8eaef" />
        <circle cx="110" cy="164" r="3.2" fill="#e8eaef" />
        <circle cx="186" cy="156" r="3.2" fill="#e8eaef" />
        <circle cx="168" cy="160" r="3.2" fill="#e8eaef" />
        <circle cx="150" cy="164" r="3.2" fill="#e8eaef" />

        <ellipse cx="130" cy="108" rx="36" ry="28" fill="url(#thorax)" />
        <ellipse cx="130" cy="132" rx="18" ry="22" fill="#d5d8de" />
        <ellipse cx="130" cy="96" rx="28" ry="22" fill="#eef0ea" />

        <path
          d="M112 78 Q104 52 92 38"
          fill="none"
          stroke="#dfe3ea"
          strokeWidth="1.8"
        />
        <path
          d="M148 78 Q156 52 168 38"
          fill="none"
          stroke="#dfe3ea"
          strokeWidth="1.8"
        />
        <circle cx="92" cy="38" r="3.4" fill="#cfd6e2" />
        <circle cx="168" cy="38" r="3.4" fill="#cfd6e2" />

        <circle
          cx="112"
          cy="88"
          r="16"
          fill={eye}
          opacity={0.95}
          style={{ filter: `drop-shadow(0 0 ${6 + glow * 10}px ${eye})` }}
        />
        <circle
          cx="148"
          cy="88"
          r="16"
          fill={eye}
          opacity={0.95}
          style={{ filter: `drop-shadow(0 0 ${6 + glow * 10}px ${eye})` }}
        />
        <circle cx="108" cy="84" r="4" fill="#fff" opacity="0.55" />
        <circle cx="144" cy="84" r="4" fill="#fff" opacity="0.55" />

        <path
          d="M122 98 H138"
          stroke="#2a2d36"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>
      {!motion ? null : <title>Polyfly</title>}
    </svg>
  );
}
