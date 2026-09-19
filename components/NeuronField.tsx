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
  const count = 208;
  const cx = width * 0.5;
  const cy = height * 0.46;
  const rx = width * 0.34;
  const ry = height * 0.28;

  for (let i = 0; i < count; i += 1) {
    const hemi: 0 | 1 = i < count / 2 ? 0 : 1;
    const t = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    const ox = hemi === 0 ? -rx * 0.62 : rx * 0.62;
    neurons.push({
      x: cx + ox + Math.cos(t) * rx * 0.55 * r,
      y: cy + Math.sin(t) * ry * r * 1.15,
      hemi,
      phase: rand() * Math.PI * 2,
      size: 1.1 + rand() * 1.8,
      fire: 0,
    });
  }

  const synapses: Synapse[] = [];
  for (let i = 0; i < neurons.length; i += 1) {
    const a = neurons[i];
    let links = 0;
    for (let j = i + 1; j < neurons.length && links < 3; j += 1) {
      const b = neurons[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.hypot(dx, dy);
      const same = a.hemi === b.hemi;
      if ((same && d < 58) || (!same && d < 46 && rand() < 0.12)) {
        synapses.push({ a: i, b: j, w: same ? 0.7 : 0.35 });
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
  const burst = 1 + Math.min(1.4, Math.abs(difference) / 14);
  if (side === "HOLD") return 0.22 * base;
  if (side === "BUY") return (hemi === 1 ? 1.55 : 0.38) * base * burst;
  if (side === "SELL") return (hemi === 0 ? 1.55 : 0.38) * base * burst;
  return 0.28 * base;
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

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      field = buildField(w, h);
    };

    const draw = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
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
      const spikeScale = Math.min(1.6, 0.55 + (n?.total_spikes ?? 0) / 1_200_000);

      if (stimulus === "reward") {
        pulse = Math.min(1, pulse + dt * 1.8);
        pulseKind = "reward";
      } else if (stimulus === "aversive") {
        pulse = Math.min(1, pulse + dt * 1.8);
        pulseKind = "aversive";
      } else {
        pulse = Math.max(0, pulse - dt * 0.9);
        if (pulse === 0) pulseKind = "none";
      }

      ctx.clearRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * 0.5, h * 0.42, 20, w * 0.5, h * 0.5, w * 0.62);
      g.addColorStop(0, "rgba(14, 28, 48, 0.35)");
      g.addColorStop(1, "rgba(5, 8, 15, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      if (pulse > 0.02) {
        const pg = ctx.createRadialGradient(w * 0.5, h * 0.46, 10, w * 0.5, h * 0.5, w * 0.48);
        if (pulseKind === "reward") {
          pg.addColorStop(0, `rgba(245, 185, 66, ${0.16 * pulse})`);
          pg.addColorStop(1, "rgba(245, 185, 66, 0)");
        } else {
          pg.addColorStop(0, `rgba(155, 140, 255, ${0.14 * pulse})`);
          pg.addColorStop(1, "rgba(155, 140, 255, 0)");
        }
        ctx.fillStyle = pg;
        ctx.fillRect(0, 0, w, h);
      }

      const synapseAlpha = 0.045 + Math.min(0.12, (changed / 8000) * 0.1) * efficacy;
      ctx.lineWidth = 0.7;
      for (const s of field.synapses) {
        const a = field.neurons[s.a];
        const b = field.neurons[s.b];
        const lit = a.fire > 0.35 && b.fire > 0.35;
        ctx.strokeStyle = lit
          ? pulseKind === "reward"
            ? `rgba(245, 185, 66, ${0.28 + a.fire * 0.35})`
            : `rgba(110, 231, 245, ${0.22 + a.fire * 0.35})`
          : `rgba(110, 231, 245, ${synapseAlpha * s.w})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (const neuron of field.neurons) {
        if (!reduce) {
          const rate = rateFor(neuron.hemi, side, leftHz, rightHz, difference) * spikeScale;
          if (Math.random() < rate * dt * 6.5) neuron.fire = 1;
          neuron.fire = Math.max(0, neuron.fire - dt * 2.4);
        } else {
          neuron.fire = neuron.hemi === 0 ? 0.18 : 0.22;
        }

        const warm = neuron.hemi === 0 ? 0.55 : 0.15;
        const r = 110 + warm * 120;
        const gCol = 210 - warm * 40;
        const bCol = 245 - warm * 170;
        const idle = 0.08 + 0.05 * (0.5 + 0.5 * Math.sin(now / 900 + neuron.phase));
        const alpha = 0.12 + idle + neuron.fire * 0.75;
        const radius = neuron.size + neuron.fire * 2.8;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r | 0}, ${gCol | 0}, ${bCol | 0}, ${alpha})`;
        ctx.arc(neuron.x, neuron.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (neuron.fire > 0.4) {
          ctx.beginPath();
          ctx.fillStyle =
            pulseKind === "reward"
              ? `rgba(255, 210, 122, ${neuron.fire * 0.35})`
              : `rgba(190, 250, 255, ${neuron.fire * 0.28})`;
          ctx.arc(neuron.x, neuron.y, radius * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    if (reduce) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [motion]);

  return (
    <canvas
      ref={canvasRef}
      className="neuron-canvas"
      aria-hidden="true"
    />
  );
}
