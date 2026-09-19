import type {
  ConsciousnessSource,
  ConsciousnessState,
  NeuralState,
  RawSnapshot,
} from "@/lib/types";

export const W_PHI = 0.3;
export const W_BROADCAST = 0.3;
export const W_SELF = 0.2;
export const W_COMPLEXITY = 0.2;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function asNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function composeCI(parts: {
  phi: number;
  broadcast: number;
  self: number;
  complexity: number;
}): number {
  return clamp01(
    W_PHI * parts.phi +
      W_BROADCAST * parts.broadcast +
      W_SELF * parts.self +
      W_COMPLEXITY * parts.complexity,
  );
}

function asTimeline(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const points = value.map((item) => clamp01(Number(item))).filter((n) => Number.isFinite(n));
  return points.length ? points : undefined;
}

function fromNested(value: unknown, fallbackSource: ConsciousnessSource): ConsciousnessState | null {
  if (!isRecord(value)) return null;
  const phi = asNumber(value.phi ?? value.consciousness_phi);
  const broadcast = asNumber(value.broadcast ?? value.gw ?? value.consciousness_gw);
  const self = asNumber(value.self ?? value.consciousness_self);
  const complexity = asNumber(value.complexity ?? value.cmplx ?? value.consciousness_cmplx);
  const ciRaw = asNumber(value.ci ?? value.consciousness_ci);
  if (phi == null && broadcast == null && self == null && complexity == null && ciRaw == null) {
    return null;
  }
  const parts = {
    phi: clamp01(phi ?? 0),
    broadcast: clamp01(broadcast ?? 0),
    self: clamp01(self ?? 0),
    complexity: clamp01(complexity ?? 0),
  };
  const source =
    value.source === "live" || value.source === "adapted" || value.source === "demo"
      ? value.source
      : fallbackSource;
  return {
    ci: clamp01(ciRaw ?? composeCI(parts)),
    ...parts,
    timeline: asTimeline(value.timeline ?? value.consciousness_timeline),
    source,
  };
}

function fromFlat(value: unknown, fallbackSource: ConsciousnessSource): ConsciousnessState | null {
  if (!isRecord(value)) return null;
  return fromNested(
    {
      ci: value.consciousness_ci,
      phi: value.consciousness_phi,
      broadcast: value.consciousness_gw ?? value.consciousness_broadcast,
      self: value.consciousness_self,
      complexity: value.consciousness_cmplx ?? value.consciousness_complexity,
      timeline: value.consciousness_timeline,
      source: value.consciousness_source,
    },
    fallbackSource,
  );
}

export function parseConsciousness(
  value: unknown,
  fallbackSource: ConsciousnessSource = "adapted",
): ConsciousnessState | null {
  if (!isRecord(value)) return null;
  return fromNested(value.consciousness, fallbackSource) ?? fromFlat(value, fallbackSource);
}

function wave(t: number, period: number, phase: number): number {
  return 0.5 + 0.5 * Math.sin(t / period + phase);
}

export function demoConsciousness(neural?: NeuralState, tick = 0): ConsciousnessState {
  const t = Date.now() / 1000 + tick * 0.37;
  const side = neural?.side ?? "HOLD";
  const stimulus = neural?.stimulus ?? "none";
  const hzBoost = Math.min(0.08, Math.abs(neural?.difference_hz ?? 0) / 80);

  const phi = clamp01(
    0.14 + 0.1 * wave(t, 3.2, 0.2) + (side === "BUY" ? 0.05 : side === "SELL" ? 0.03 : 0),
  );
  const broadcast = clamp01(
    0.52 +
      0.14 * wave(t, 2.5, 1.1) +
      (side === "BUY" ? 0.06 : 0) +
      (stimulus === "reward" ? 0.08 : 0),
  );
  const self = clamp01(0.045 + 0.05 * wave(t, 4.1, 0.7) + hzBoost * 0.4);
  const complexity = clamp01(
    0.07 +
      0.08 * wave(t, 5.0, 2.2) +
      (stimulus === "aversive" ? 0.07 : 0) +
      hzBoost,
  );
  const ci = composeCI({ phi, broadcast, self, complexity });

  const timeline = Array.from({ length: 48 }, (_, i) => {
    const u = t - (47 - i) * 0.45;
    const p = clamp01(0.14 + 0.1 * wave(u, 3.2, 0.2));
    const b = clamp01(0.52 + 0.14 * wave(u, 2.5, 1.1));
    const s = clamp01(0.045 + 0.05 * wave(u, 4.1, 0.7));
    const c = clamp01(0.07 + 0.08 * wave(u, 5.0, 2.2));
    return composeCI({ phi: p, broadcast: b, self: s, complexity: c });
  });
  timeline[timeline.length - 1] = ci;

  return { ci, phi, broadcast, self, complexity, timeline, source: "demo" };
}

export function resolveConsciousness(
  snap: RawSnapshot,
  extra: unknown,
  source: "demo" | "remote",
): ConsciousnessState {
  const parsed =
    parseConsciousness(snap, source === "remote" ? "live" : "demo") ??
    parseConsciousness(extra, source === "remote" ? "adapted" : "demo");

  if (source === "demo") {
    const live = demoConsciousness(snap.neural, snap.tick);
    if (!parsed) return live;
    return {
      ...live,
      phi: clamp01(0.65 * live.phi + 0.35 * parsed.phi),
      broadcast: clamp01(0.65 * live.broadcast + 0.35 * parsed.broadcast),
      self: clamp01(0.65 * live.self + 0.35 * parsed.self),
      complexity: clamp01(0.65 * live.complexity + 0.35 * parsed.complexity),
      ci: composeCI({
        phi: clamp01(0.65 * live.phi + 0.35 * parsed.phi),
        broadcast: clamp01(0.65 * live.broadcast + 0.35 * parsed.broadcast),
        self: clamp01(0.65 * live.self + 0.35 * parsed.self),
        complexity: clamp01(0.65 * live.complexity + 0.35 * parsed.complexity),
      }),
      source: "demo",
    };
  }

  return parsed ?? demoConsciousness(snap.neural, snap.tick);
}
