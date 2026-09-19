"use client";

import { useEffect, useRef } from "react";
import type { ConsciousnessState, NeuralState } from "@/lib/types";

type Soma = {
  x: number;
  y: number;
  hemi: 0 | 1 | 2;
  region: number;
  phase: number;
  size: number;
  fire: number;
  r: number;
  g: number;
  b: number;
};

type Filament = {
  a: number;
  b: number;
  cx: number;
  cy: number;
  region: number;
  hemi: 0 | 1 | 2;
  fire: number;
  phase: number;
};

type Props = {
  neural?: NeuralState;
  consciousness?: ConsciousnessState;
  motion: boolean;
};

const PALETTES: [number, number, number][][] = [
  [
    [92, 226, 255],
    [232, 92, 255],
    [255, 224, 74],
  ],
  [
    [80, 214, 255],
    [255, 92, 196],
    [255, 232, 96],
  ],
  [
    [168, 92, 255],
    [80, 230, 150],
    [255, 130, 62],
    [255, 72, 118],
  ],
  [
    [90, 150, 255],
    [150, 110, 255],
    [70, 210, 200],
  ],
];

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleEllipse(
  rand: () => number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
): [number, number] {
  const t = rand() * Math.PI * 2;
  const r = Math.sqrt(rand());
  return [cx + Math.cos(t) * rx * r, cy + Math.sin(t) * ry * r];
}

function buildConnectome(width: number, height: number) {
  const rand = mulberry32(42187);
  const somas: Soma[] = [];
  const cx = width * 0.5;
  const cy = height * 0.42;
  const scale = Math.min(width / 1180, height / 760);

  const hole = { x: cx, y: cy + 8 * scale, r: 22 * scale };

  const regions: {
    count: number;
    ox: number;
    oy: number;
    rx: number;
    ry: number;
    hemi: 0 | 1 | 2;
    region: number;
  }[] = [
    { count: 220, ox: -280, oy: -8, rx: 168, ry: 150, hemi: 0, region: 0 },
    { count: 220, ox: 280, oy: -8, rx: 168, ry: 150, hemi: 1, region: 1 },
    { count: 70, ox: -118, oy: -70, rx: 70, ry: 48, hemi: 0, region: 2 },
    { count: 70, ox: 118, oy: -70, rx: 70, ry: 48, hemi: 1, region: 2 },
    { count: 160, ox: 0, oy: -18, rx: 128, ry: 92, hemi: 2, region: 2 },
    { count: 80, ox: 0, oy: 78, rx: 86, ry: 48, hemi: 2, region: 2 },
    { count: 120, ox: 0, oy: 198, rx: 62, ry: 132, hemi: 2, region: 3 },
  ];

  for (const region of regions) {
    let added = 0;
    let guard = 0;
    while (added < region.count && guard < region.count * 8) {
      guard += 1;
      const [x, y] = sampleEllipse(
        rand,
        cx + region.ox * scale,
        cy + region.oy * scale,
        region.rx * scale,
        region.ry * scale,
      );
      if (Math.hypot(x - hole.x, y - hole.y) < hole.r) continue;
      if (y < 8 || y > height - 8 || x < 8 || x > width - 8) continue;
      const palette = PALETTES[region.region];
      const color = palette[Math.floor(rand() * palette.length)];
      somas.push({
        x,
        y,
        hemi: region.hemi,
        region: region.region,
        phase: rand() * Math.PI * 2,
        size: 0.7 + rand() * 1.6,
        fire: rand() * 0.15,
        r: color[0],
        g: color[1],
        b: color[2],
      });
      added += 1;
    }
  }

  const filaments: Filament[] = [];
  const buckets = new Map<string, number[]>();
  const cell = 28;
  somas.forEach((soma, i) => {
    const key = `${Math.floor(soma.x / cell)}:${Math.floor(soma.y / cell)}`;
    const list = buckets.get(key) ?? [];
    list.push(i);
    buckets.set(key, list);
  });

  const neighbors = (i: number) => {
    const soma = somas[i];
    const gx = Math.floor(soma.x / cell);
    const gy = Math.floor(soma.y / cell);
    const found: number[] = [];
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        const list = buckets.get(`${gx + dx}:${gy + dy}`);
        if (!list) continue;
        for (const j of list) {
          if (j > i) found.push(j);
        }
      }
    }
    return found;
  };

  for (let i = 0; i < somas.length; i += 1) {
    const a = somas[i];
    const near = neighbors(i)
      .map((j) => ({ j, d: Math.hypot(a.x - somas[j].x, a.y - somas[j].y) }))
      .sort((p, q) => p.d - q.d);
    let links = 0;
    for (const item of near) {
      if (links >= 6) break;
      const b = somas[item.j];
      const same = a.region === b.region || a.hemi === b.hemi;
      if (item.d > (same ? 46 : 34)) continue;
      if (!same && rand() > 0.22) continue;
      filaments.push({
        a: i,
        b: item.j,
        cx: (a.x + b.x) / 2 + (rand() - 0.5) * 10,
        cy: (a.y + b.y) / 2 + (rand() - 0.5) * 10,
        region: a.region,
        hemi: a.hemi === b.hemi ? a.hemi : 2,
        fire: 0,
        phase: rand() * Math.PI * 2,
      });
      links += 1;
    }
  }

  return { somas, filaments, hole };
}

function hemiBias(hemi: 0 | 1 | 2, side: string): number {
  if (side === "BUY") return hemi === 1 ? 1.7 : hemi === 0 ? 0.42 : 1;
  if (side === "SELL") return hemi === 0 ? 1.7 : hemi === 1 ? 0.42 : 1;
  return 0.72;
}

export function NeuronField({ neural, consciousness, motion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neuralRef = useRef(neural);
  const ciRef = useRef(consciousness);
  neuralRef.current = neural;
  ciRef.current = consciousness;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      !motion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let field = buildConnectome(canvas.clientWidth || 1100, canvas.clientHeight || 720);
    let raf = 0;
    let last = performance.now();
    let pulse = 0;
    let pulseKind: "reward" | "aversive" | "none" = "none";

    const paint = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w < 2 || h < 2) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const n = neuralRef.current;
      const mind = ciRef.current;
      const side = n?.side ?? "HOLD";
      const stimulus = n?.stimulus ?? "none";
      const ci = mind?.ci ?? 0.22;
      const spikes = n?.total_spikes ?? 400000;
      const activity = Math.min(
        1.8,
        0.35 + ci * 1.15 + Math.min(0.35, spikes / 1_800_000) + Math.abs(n?.difference_hz ?? 0) / 28,
      );

      if (stimulus === "reward") {
        pulse = Math.min(1, pulse + dt * 1.8);
        pulseKind = "reward";
      } else if (stimulus === "aversive") {
        pulse = Math.min(1, pulse + dt * 1.8);
        pulseKind = "aversive";
      } else {
        pulse = Math.max(0, pulse - dt * 0.8);
        if (pulse === 0) pulseKind = "none";
      }

      ctx.clearRect(0, 0, w, h);
      const wash = ctx.createRadialGradient(w * 0.5, h * 0.4, 20, w * 0.5, h * 0.46, w * 0.62);
      wash.addColorStop(0, "rgba(18, 28, 58, 0.55)");
      wash.addColorStop(1, "rgba(5, 8, 15, 0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      if (pulse > 0.02) {
        const pg = ctx.createRadialGradient(w * 0.5, h * 0.42, 16, w * 0.5, h * 0.45, w * 0.48);
        pg.addColorStop(
          0,
          pulseKind === "reward"
            ? `rgba(255, 150, 70, ${0.16 * pulse})`
            : `rgba(210, 90, 255, ${0.14 * pulse})`,
        );
        pg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = pg;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.lineWidth = 0.7;
      for (const filament of field.filaments) {
        const a = field.somas[filament.a];
        const b = field.somas[filament.b];
        const bias = hemiBias(filament.hemi, side);
        if (!reduce) {
          const rate = activity * bias * (0.55 + 0.45 * (mind?.broadcast ?? 0.5));
          if (Math.random() < rate * dt * 5.4) filament.fire = 1;
          filament.fire = Math.max(0, filament.fire - dt * (1.6 + (1 - ci)));
        } else {
          filament.fire = 0.18 + 0.22 * ((filament.phase % 1) * bias) * ci;
        }
        const lit = filament.fire;
        const idle = 0.045 + 0.03 * ci;
        ctx.strokeStyle =
          lit > 0.2
            ? `rgba(${a.r}, ${a.g}, ${a.b}, ${0.18 + lit * 0.72})`
            : `rgba(${a.r}, ${a.g}, ${a.b}, ${idle})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(filament.cx, filament.cy, b.x, b.y);
        ctx.stroke();
      }

      for (const soma of field.somas) {
        const bias = hemiBias(soma.hemi, side);
        if (!reduce) {
          const rate = activity * bias * (0.45 + ci);
          if (Math.random() < rate * dt * 6.8) soma.fire = 1;
          soma.fire = Math.max(0, soma.fire - dt * 2.2);
        } else {
          soma.fire = 0.2 + 0.2 * ci * bias;
        }
        const glow = soma.fire;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${soma.r}, ${soma.g}, ${soma.b}, ${0.16 + glow * 0.78})`;
        ctx.arc(soma.x, soma.y, soma.size + glow * 2.4, 0, Math.PI * 2);
        ctx.fill();
        if (glow > 0.35) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${soma.r}, ${soma.g}, ${soma.b}, ${glow * 0.22})`;
          ctx.arc(soma.x, soma.y, soma.size * 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      field = buildConnectome(w, h);
      paint(performance.now());
    };

    const tick = (now: number) => {
      paint(now);
      if (!reduce) raf = requestAnimationFrame(tick);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (!reduce) raf = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [motion]);

  return <canvas ref={canvasRef} className="neuron-canvas" aria-hidden="true" />;
}
