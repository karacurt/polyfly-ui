"use client";

import type { NeuralSide } from "@/lib/types";

type FlyAvatarProps = {
  side: NeuralSide;
  motion: boolean;
  intensity?: number;
};

export function FlyAvatar({ side, motion, intensity = 0 }: FlyAvatarProps) {
  const glow = Math.min(1, Math.max(0.2, intensity));
  const halo = side === "SELL" ? "#ff4b78" : side === "BUY" ? "#bdff32" : "#61adff";

  return (
    <svg
      className="fly-svg"
      viewBox="0 0 280 200"
      role="img"
      aria-label="Avatar decorativo de mosca"
    >
      <defs>
        <radialGradient id="wingGlass" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f4f7ff" stopOpacity="0.55" />
          <stop offset="70%" stopColor="#9eb0c8" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#6d7f96" stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id="thorax" cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#e6e8e2" />
          <stop offset="100%" stopColor="#9aa0a8" />
        </radialGradient>
        <radialGradient id="eyeRed" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff6a7d" />
          <stop offset="55%" stopColor="#ff2d4a" />
          <stop offset="100%" stopColor="#8a1024" />
        </radialGradient>
        <filter id="halo">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse
        cx="142"
        cy="168"
        rx="46"
        ry="8"
        fill="#000"
        opacity="0.28"
      />

      <g className="fly-body">
        <g className="wing-l">
          <ellipse
            cx="78"
            cy="58"
            rx="78"
            ry="26"
            fill="url(#wingGlass)"
            stroke="#e4ebf5"
            strokeWidth="1.4"
            transform="rotate(-22 78 58)"
          />
          <path
            d="M28 50 C58 40 96 48 118 70"
            fill="none"
            stroke="#d5deea"
            strokeWidth="0.8"
            opacity="0.8"
          />
          <path
            d="M40 62 C70 54 100 62 120 78"
            fill="none"
            stroke="#d5deea"
            strokeWidth="0.6"
            opacity="0.55"
          />
        </g>
        <g className="wing-r">
          <ellipse
            cx="206"
            cy="58"
            rx="78"
            ry="26"
            fill="url(#wingGlass)"
            stroke="#e4ebf5"
            strokeWidth="1.4"
            transform="rotate(22 206 58)"
          />
          <path
            d="M252 50 C222 40 184 48 162 70"
            fill="none"
            stroke="#d5deea"
            strokeWidth="0.8"
            opacity="0.8"
          />
        </g>

        <path d="M118 138 L96 176" stroke="#dfe3ea" strokeWidth="2.4" />
        <path d="M132 142 L124 182" stroke="#dfe3ea" strokeWidth="2.4" />
        <path d="M146 144 L148 184" stroke="#dfe3ea" strokeWidth="2.4" />
        <path d="M164 138 L186 176" stroke="#dfe3ea" strokeWidth="2.4" />
        <path d="M150 142 L158 182" stroke="#dfe3ea" strokeWidth="2.4" />
        <circle cx="96" cy="176" r="3.6" fill="#eef1f6" />
        <circle cx="124" cy="182" r="3.6" fill="#eef1f6" />
        <circle cx="148" cy="184" r="3.6" fill="#eef1f6" />
        <circle cx="186" cy="176" r="3.6" fill="#eef1f6" />
        <circle cx="158" cy="182" r="3.6" fill="#eef1f6" />

        <ellipse cx="142" cy="128" rx="22" ry="28" fill="#c9ced6" />
        <ellipse cx="142" cy="118" rx="34" ry="30" fill="url(#thorax)" />
        <ellipse cx="142" cy="102" rx="30" ry="24" fill="#f4f5f0" />

        <path d="M124 84 Q114 52 98 34" fill="none" stroke="#e8edf4" strokeWidth="2" />
        <path d="M160 84 Q170 52 186 34" fill="none" stroke="#e8edf4" strokeWidth="2" />
        <circle cx="98" cy="34" r="3.8" fill="#cfd6e2" />
        <circle cx="186" cy="34" r="3.8" fill="#cfd6e2" />

        <circle
          cx="122"
          cy="92"
          r="20"
          fill={halo}
          opacity={0.22 + glow * 0.25}
          filter="url(#halo)"
        />
        <circle
          cx="162"
          cy="92"
          r="20"
          fill={halo}
          opacity={0.22 + glow * 0.25}
          filter="url(#halo)"
        />
        <circle cx="122" cy="92" r="17" fill="url(#eyeRed)" />
        <circle cx="162" cy="92" r="17" fill="url(#eyeRed)" />
        <circle cx="116" cy="86" r="4.5" fill="#fff" opacity="0.55" />
        <circle cx="156" cy="86" r="4.5" fill="#fff" opacity="0.55" />
        <circle cx="126" cy="96" r="1.6" fill="#3a0710" />
        <circle cx="166" cy="96" r="1.6" fill="#3a0710" />

        {motion ? <title>Polyfly</title> : null}
      </g>
    </svg>
  );
}
