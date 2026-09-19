"use client";

import { useEffect, useRef } from "react";
import type { NeuralState } from "@/lib/types";

type Neuron = {
  x: number;
  y: number;
  hemi: 0 | 1;
  phase: number;
  size: number;
  fire: number;
};

type Synapse = {
  a: number;
  b: number;
  w: number;
};

type Props = {
  neural?: NeuralState;
  motion: boolean;
};

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildField(width: number, height: number) {
  const rand = mulberry32(17891);
  const neurons: Neuron[] = [];
  const count = 236;
  const cx = width * 0.5;
  const cy = height * 0.44;
  const rx = Math.max(160, width * 0.38);
  const ry = Math.max(110, height * 0.3);

  for (let i = 0; i < count; i += 1) {
    const hemi: 0 | 1 = i < count / 2 ? 0 : 1;
    const t = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    const ox = hemi === 0 ? -rx * 0.58 : rx * 0.58;
    neurons.push({
      x: cx + ox + Math.cos(t) * rx * 0.58 * r,
      y: cy + Math.sin(t) * ry * r * 1.12,
      hemi,
      phase: rand() * Math.PI * 2,
      size: 1.2 + rand() * 2.1,
      fire: rand() * 0.2,
    });
  }

  const synapses: Synapse[] = [];
  for (let i = 0; i < neurons.length; i += 1) {
    const a = neurons[i];
    let links = 0;
    for (let j = i + 1; j < neurons.length && links < 4; j += 1) {
      const b = neurons[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const same = a.hemi === b.hemi;
      if ((same && d < 72) || (!same && d < 56 && rand() < 0.16)) {
        synapses.push({ a: i, b: j, w: same ? 0.8 : 0.4 });
        links += 1;
      }
    }
  }

  return { neurons, synapses };
}

function rateFor(
  hemi: 0 | 1,
  side: string,
  leftHz: number,
  rightHz: number,
  difference: number,
) {
  const base = (hemi === 0 ? leftHz : rightHz) / 42;
  const burst = 1 + Math.min(1.6, Math.abs(difference) / 12);
  if (side === "HOLD") return 0.28 * Math.max(0.35, base);
  if (side === "BUY") return (hemi === 1 ? 1.85 : 0.32) * base * burst;
  if (side === "SELL") return (hemi === 0 ? 1.85 : 0.32) * base * burst;
  return 0.32 * base;
}

export function NeuronField({ neural, motion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neuralRef = useRef(neural);
  neuralRef.current = neural;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce =
      !motion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let field = buildField(canvas.clientWidth || 800, canvas.clientHeight || 600);
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
      const side = n?.side ?? "HOLD";
      const leftHz = n?.left_hz ?? 40;
      const rightHz = n?.right_hz ?? 40;
      const difference = n?.difference_hz ?? 0;
      const stimulus = n?.stimulus ?? "none";
      const changed = n?.memory?.changed_edges ?? 0;
      const efficacy = n?.memory?.mean_efficacy ?? 1;
      const spikeScale = Math.min(1.7, 0.6 + (n?.total_spikes ?? 0) / 1_200_000);

      if (stimulus === "reward") {
        pulse = Math.min(1, pulse + dt * 1.8);
        pulseKind = "reward";
      } else if (stimulus === "aversive") {
        pulse = Math.min(1, pulse + dt * 1.8);
        pulseKind = "aversive";
      } else {
        pulse = Math.max(0, pulse - dt * 0.85);
        if (pulse === 0) pulseKind = "none";
      }

      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 30, w * 0.5, h * 0.48, w * 0.7);
      g.addColorStop(0, "rgba(18, 36, 58, 0.45)");
      g.addColorStop(1, "rgba(5, 8, 15, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      if (pulse > 0.02) {
        const pg = ctx.createRadialGradient(w * 0.5, h * 0.46, 12, w * 0.5, h * 0.5, w * 0.5);
        if (pulseKind === "reward") {
          pg.addColorStop(0, `rgba(245, 185, 66, ${0.2 * pulse})`);
          pg.addColorStop(1, "rgba(245, 185, 66, 0)");
        } else {
          pg.addColorStop(0, `rgba(155, 140, 255, ${0.16 * pulse})`);
          pg.addColorStop(1, "rgba(155, 140, 255, 0)");
        }
        ctx.fillStyle = pg;
        ctx.fillRect(0, 0, w, h);
      }

      const synapseAlpha = 0.07 + Math.min(0.16, (changed / 8000) * 0.12) * efficacy;
      ctx.lineWidth = 0.85;
      for (const s of field.synapses) {
        const a = field.neurons[s.a];
        const b = field.neurons[s.b];
        const lit = a.fire > 0.32 && b.fire > 0.32;
        const amberBias = a.hemi === 0 && b.hemi === 0;
        ctx.strokeStyle = lit
          ? pulseKind === "reward" || amberBias
            ? `rgba(245, 185, 66, ${0.34 + a.fire * 0.4})`
            : `rgba(110, 231, 245, ${0.3 + a.fire * 0.4})`
          : amberBias
            ? `rgba(245, 185, 66, ${synapseAlpha * s.w * 0.85})`
            : `rgba(110, 231, 245, ${synapseAlpha * s.w})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (const neuron of field.neurons) {
        if (!reduce) {
          const rate = rateFor(neuron.hemi, side, leftHz, rightHz, difference) * spikeScale;
          if (Math.random() < rate * dt * 7.2) neuron.fire = 1;
          neuron.fire = Math.max(0, neuron.fire - dt * 2.1);
        } else {
          const bias = rateFor(neuron.hemi, side, leftHz, rightHz, difference);
          neuron.fire = 0.22 + (neuron.phase % 1) * 0.18 * Math.min(1.4, bias);
        }

        const warm = neuron.hemi === 0 ? 0.72 : 0.08;
        const r = 110 + warm * 135;
        const gCol = 214 - warm * 48;
        const bCol = 245 - warm * 190;
        const idle = 0.1 + 0.06 * (0.5 + 0.5 * Math.sin(now / 900 + neuron.phase));
        const alpha = 0.16 + idle + neuron.fire * 0.78;
        const radius = neuron.size + neuron.fire * 3.1;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r | 0}, ${gCol | 0}, ${bCol | 0}, ${alpha})`;
        ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (neuron.fire > 0.28) {
          ctx.beginPath();
          ctx.fillStyle =
            pulseKind === "reward" || neuron.hemi === 0
              ? `rgba(255, 210, 122, ${neuron.fire * 0.32})`
              : `rgba(190, 250, 255, ${neuron.fire * 0.3})`;
          ctx.arc(neuron.x, neuron.y, radius * 3.4, 0, Math.PI * 2);
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
      field = buildField(w, h);
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
