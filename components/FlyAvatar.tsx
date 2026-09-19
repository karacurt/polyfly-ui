"use client";

import type { NeuralSide } from "@/lib/types";

type FlyAvatarProps = {
  side: NeuralSide;
  motion: boolean;
  intensity?: number;
};

export function FlyAvatar({ side, motion, intensity = 0 }: FlyAvatarProps) {
  const glow = Math.min(1, Math.max(0.22, intensity));
  const halo = side === "SELL" ? "#f5b942" : side === "BUY" ? "#6ee7f5" : "#9aa8c2";

  return (
    <svg
      className="fly-svg"
      viewBox="0 0 280 200"
      role="img"
      aria-label="Decorative fruit-fly avatar"
    >
      <defs>
        <radialGradient id="wingGlass" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f4f7ff" stopOpacity="0.42" />
          <stop offset="70%" stopColor="#7f93b0" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#6d7f96" stopOpacity="0.04" />
        </radialGradient>
        <radialGradient id="thorax" cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#d5dbe6" />
          <stop offset="100%" stopColor="#8a93a3" />
        </radialGradient>
        <radialGradient id="eyeCore" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#8af0ff" />
          <stop offset="55%" stopColor="#2aa8b8" />
          <stop offset="100%" stopColor="#123040" />
        </radialGradient>
        <filter id="halo">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="142" cy="168" rx="46" ry="8" fill="#000" opacity="0.28" />

      <g className="fly-body">
        <g className="wing-l">
          <ellipse
            cx="78"
            cy="58"
            rx="78"
            ry="26"
            fill="url(#wingGlass)"
            stroke="#d5e4f5"
            strokeWidth="1.2"
            transform="rotate(-22 78 58)"
          />
          <path
            d="M28 50 C58 40 96 48 118 70"
            fill="none"
            stroke="#c9d7e8"
            strokeWidth="0.8"
            opacity="0.7"
          />
        </g>
        <g className="wing-r">
          <ellipse
            cx="206"
            cy="58"
            rx="78"
            ry="26"
            fill="url(#wingGlass)"
            stroke="#d5e4f5"
            strokeWidth="1.2"
            transform="rotate(22 206 58)"
          />
          <path
            d="M252 50 C222 40 184 48 162 70"
            fill="none"
            stroke="#c9d7e8"
            strokeWidth="0.8"
            opacity="0.7"
          />
        </g>

        <path d="M118 138 L96 176" stroke="#dfe3ea" strokeWidth="2.2" />
        <path d="M132 142 L124 182" stroke="#dfe3ea" strokeWidth="2.2" />
        <path d="M146 144 L148 184" stroke="#dfe3ea" strokeWidth="2.2" />
        <path d="M164 138 L186 176" stroke="#dfe3ea" strokeWidth="2.2" />
        <path d="M150 142 L158 182" stroke="#dfe3ea" strokeWidth="2.2" />
        <circle cx="96" cy="176" r="3.4" fill="#eef1f6" />
        <circle cx="124" cy="182" r="3.4" fill="#eef1f6" />
        <circle cx="148" cy="184" r="3.4" fill="#eef1f6" />
        <circle cx="186" cy="176" r="3.4" fill="#eef1f6" />
        <circle cx="158" cy="182" r="3.4" fill="#eef1f6" />

        <ellipse cx="142" cy="128" rx="22" ry="28" fill="#c3cad4" />
        <ellipse cx="142" cy="118" rx="34" ry="30" fill="url(#thorax)" />
        <ellipse cx="142" cy="102" rx="30" ry="24" fill="#f4f5f0" />

        <path d="M124 84 Q114 52 98 34" fill="none" stroke="#e8edf4" strokeWidth="2" />
        <path d="M160 84 Q170 52 186 34" fill="none" stroke="#e8edf4" strokeWidth="2" />
        <circle cx="98" cy="34" r="3.6" fill="#cfd6e2" />
        <circle cx="186" cy="34" r="3.6" fill="#cfd6e2" />

        <circle
          cx="122"
          cy="92"
          r="20"
          fill={halo}
          opacity={0.2 + glow * 0.28}
          filter="url(#halo)"
        />
        <circle
          cx="162"
          cy="92"
          r="20"
          fill={halo}
          opacity={0.2 + glow * 0.28}
          filter="url(#halo)"
        />
        <circle cx="122" cy="92" r="17" fill="url(#eyeCore)" />
        <circle cx="162" cy="92" r="17" fill="url(#eyeCore)" />
        <circle cx="116" cy="86" r="4.5" fill="#fff" opacity="0.55" />
        <circle cx="156" cy="86" r="4.5" fill="#fff" opacity="0.55" />
        <circle cx="126" cy="96" r="1.6" fill="#071318" />
        <circle cx="166" cy="96" r="1.6" fill="#071318" />
        {motion ? <title>Polyfly</title> : null}
      </g>
    </svg>
  );
}
