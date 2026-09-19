import { copy } from "@/lib/i18n";

export function HowItWorks({ chartUrl }: { chartUrl: string }) {
  return (
    <section id="how-it-works" className="explainer" aria-labelledby="how-title">
      <div className="explain-intro">
        <p className="section-kicker">{copy.howLink}</p>
        <h2 id="how-title">{copy.howTitle}</h2>
        <p>{copy.howLead}</p>
      </div>

      <div className="explain-grid">
        <article className="explain-step">
          <div className="step-label">
            <span>{copy.step1Label}</span>
            <span>{copy.step1Meta}</span>
          </div>
          <figure className="explain-art">
            {/* Sensory frame is a demo seed PNG, not a layout-critical LCP photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={chartUrl} width={320} height={180} alt={copy.latestFrame} />
            <figcaption>{copy.step1Caption}</figcaption>
          </figure>
          <h3>{copy.step1Title}</h3>
          <p>{copy.step1Body}</p>
        </article>

        <article className="explain-step">
          <div className="step-label">
            <span>{copy.step2Label}</span>
            <span>{copy.step2Meta}</span>
          </div>
          <figure className="explain-art">
            <svg viewBox="0 0 440 210" role="img" aria-label={copy.step2Caption}>
              <defs>
                <radialGradient id="cellOn" cx="35%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#d9fbff" />
                  <stop offset="100%" stopColor="#2aa8b8" />
                </radialGradient>
              </defs>
              <g fill="none" stroke="rgba(110,231,245,0.16)" strokeWidth="1.4">
                <path d="M48 70C92 40 140 48 176 78C210 40 268 36 312 78C350 48 392 70 412 104" />
                <path d="M40 120C88 150 150 156 196 124C248 162 310 158 368 122" />
              </g>
              {(
                [
                  [56, 72],
                  [118, 58],
                  [176, 80],
                  [236, 52],
                  [312, 78],
                  [372, 96],
                  [88, 128],
                  [160, 138],
                  [228, 122],
                  [300, 140],
                  [360, 124],
                ] as const
              ).map(([x, y], i) => (
                <circle
                  key={`${x}-${y}`}
                  cx={x}
                  cy={y}
                  r={i % 3 === 0 ? 7 : 5}
                  fill={i % 3 === 0 ? "url(#cellOn)" : "rgba(154,168,194,0.45)"}
                />
              ))}
            </svg>
            <figcaption>{copy.step2Caption}</figcaption>
          </figure>
          <h3>{copy.step2Title}</h3>
          <p>
            {copy.step2Body.split("MaleCNS v1.0").map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <strong>MaleCNS v1.0</strong>
                </span>
              ) : (
                <span key={i}>{part}</span>
              ),
            )}
          </p>
        </article>

        <article className="explain-step">
          <div className="step-label">
            <span>{copy.step3Label}</span>
            <span>{copy.step3Meta}</span>
          </div>
          <figure className="explain-art">
            <svg viewBox="0 0 440 210" role="img" aria-label={copy.step3Caption}>
              {[
                ["BUY", 80, "#6ee7f5"],
                ["SELL", 220, "#f5b942"],
                ["HOLD", 360, "#9aa8c2"],
              ].map(([label, x, color]) => (
                <g key={label}>
                  <rect
                    x={Number(x) - 52}
                    y="46"
                    width="104"
                    height="52"
                    rx="16"
                    fill="rgba(255,255,255,0.03)"
                    stroke={String(color)}
                    strokeOpacity="0.45"
                  />
                  <text
                    x={Number(x)}
                    y="78"
                    textAnchor="middle"
                    fill={String(color)}
                    fontSize="16"
                    fontFamily="Outfit, sans-serif"
                  >
                    {label}
                  </text>
                </g>
              ))}
              <rect
                x="28"
                y="132"
                width="248"
                height="50"
                rx="16"
                fill="rgba(110,231,245,0.06)"
                stroke="rgba(110,231,245,0.3)"
              />
              <text x="152" y="154" textAnchor="middle" fill="#e8eef8" fontSize="13">
                Position manager
              </text>
              <text x="152" y="172" textAnchor="middle" fill="#8b97ad" fontSize="12">
                Cash / units / limits
              </text>
              <rect
                x="296"
                y="132"
                width="116"
                height="50"
                rx="16"
                fill="rgba(245,185,66,0.08)"
                stroke="rgba(245,185,66,0.3)"
              />
              <text x="354" y="162" textAnchor="middle" fill="#ffd27a" fontSize="14">
                Paper
              </text>
            </svg>
            <figcaption>{copy.step3Caption}</figcaption>
          </figure>
          <h3>{copy.step3Title}</h3>
          <p>{copy.step3Body}</p>
        </article>

        <article className="explain-step">
          <div className="step-label">
            <span>{copy.step4Label}</span>
            <span>{copy.step4Meta}</span>
          </div>
          <figure className="explain-art">
            <svg viewBox="0 0 440 210" role="img" aria-label={copy.step4Caption}>
              <text x="36" y="36" fill="#f5b942" fontSize="13">
                Portfolio gain
              </text>
              <text x="268" y="36" fill="#9b8cff" fontSize="13">
                Portfolio loss
              </text>
              {Array.from({ length: 12 }).map((_, i) => (
                <circle
                  key={`g-${i}`}
                  cx={48 + (i % 4) * 22}
                  cy={78 + Math.floor(i / 4) * 22}
                  r="6"
                  fill="#f5b942"
                  opacity={0.35 + (i % 3) * 0.2}
                />
              ))}
              {Array.from({ length: 4 }).map((_, i) => (
                <circle
                  key={`l-${i}`}
                  cx={292 + (i % 2) * 28}
                  cy={86 + Math.floor(i / 2) * 28}
                  r="7"
                  fill="#9b8cff"
                  opacity="0.7"
                />
              ))}
              <text x="48" y="168" fill="#8b97ad" fontSize="12">
                15 PAM11
              </text>
              <text x="292" y="168" fill="#8b97ad" fontSize="12">
                2 PPL101
              </text>
            </svg>
            <figcaption>{copy.step4Caption}</figcaption>
          </figure>
          <h3>{copy.step4Title}</h3>
          <p>{copy.step4Body}</p>
        </article>
      </div>

      <div className="explain-note">
        <span className="note-icon" aria-hidden="true">
          ?
        </span>
        <div>
          <h3>{copy.disclaimerTitle}</h3>
          <p>{copy.disclaimerBody}</p>
          <p>{copy.disclaimerWorker}</p>
          <p>{copy.disclaimerPoll}</p>
          <p>{copy.ciDisclaimer}</p>
        </div>
      </div>
    </section>
  );
}
