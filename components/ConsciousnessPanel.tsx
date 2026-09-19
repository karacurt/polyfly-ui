import { copy } from "@/lib/i18n";
import type { ConsciousnessState } from "@/lib/types";

function pct(value: number | undefined): string {
  if (!Number.isFinite(value)) return "—";
  return (value as number).toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function sparkPoints(values: number[] | undefined): string {
  const series = values && values.length > 1 ? values : [0.18, 0.2, 0.19];
  const w = 320;
  const h = 64;
  return series
    .map((value, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - 6 - Math.min(1, Math.max(0, value)) * (h - 12);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const METRICS = [
  ["phi", "ciPhi"],
  ["broadcast", "ciBroadcast"],
  ["self", "ciSelf"],
  ["complexity", "ciComplexity"],
] as const;

export function ConsciousnessPanel({
  mind,
}: {
  mind?: ConsciousnessState;
}) {
  const ci = mind?.ci ?? 0;
  const sweep = Math.max(0, Math.min(1, ci)) * 251.2;
  const source =
    mind?.source === "live"
      ? copy.ciSourceLive
      : mind?.source === "adapted"
        ? copy.ciSourceAdapted
        : copy.ciSourceDemo;

  return (
    <section className="consciousness" aria-label={copy.ciTitle}>
      <div className="ci-head">
        <div>
          <p className="section-kicker">{copy.ciKicker}</p>
          <h2>{copy.ciTitle}</h2>
          <p>{copy.ciDisclaimer}</p>
        </div>
        <span className="ci-source">{source}</span>
      </div>

      <div className="ci-grid">
        <div className="ci-gauge glass-card">
          <svg viewBox="0 0 120 120" role="img" aria-label={`${copy.ciIndex} ${pct(ci)}`}>
            <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(232,238,248,0.08)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="none"
              stroke="url(#ciSweep)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${sweep} 251.2`}
              transform="rotate(-90 60 60)"
            />
            <defs>
              <linearGradient id="ciSweep" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6ee7f5" />
                <stop offset="100%" stopColor="#f5b942" />
              </linearGradient>
            </defs>
            <text x="60" y="56" textAnchor="middle" fill="#e8eef8" fontSize="22" fontFamily="Georgia, serif">
              {pct(ci)}
            </text>
            <text x="60" y="74" textAnchor="middle" fill="#8b97ad" fontSize="8" letterSpacing="1.4">
              {copy.ciIndex}
            </text>
          </svg>
        </div>

        <div className="ci-metrics glass-card">
          {METRICS.map(([key, label]) => {
            const value = mind?.[key] ?? 0;
            return (
              <div className="ci-bar" key={key}>
                <div className="ci-bar-top">
                  <span>{copy[label]}</span>
                  <strong>{pct(value)}</strong>
                </div>
                <i>
                  <b style={{ width: `${Math.min(100, value * 100)}%` }} />
                </i>
              </div>
            );
          })}
        </div>

        <div className="ci-spark glass-card">
          <div className="ci-bar-top">
            <span>{copy.ciTimeline}</span>
            <strong>CI</strong>
          </div>
          <svg viewBox="0 0 320 64" role="img" aria-label={copy.ciTimeline}>
            <polyline
              fill="none"
              stroke="#6ee7f5"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={sparkPoints(mind?.timeline)}
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
