import type { Copy } from "@/lib/i18n";

type HowItWorksProps = {
  copy: Copy;
  chartUrl: string;
};

export function HowItWorks({ copy, chartUrl }: HowItWorksProps) {
  return (
    <main id="how-view" className="explainer" aria-labelledby="how-title">
      <div className="explain-intro">
        <a className="back-link" href="#watch">
          {copy.backToFly}
        </a>
        <h1 id="how-title" tabIndex={-1}>
          {copy.howTitle}
          <span>.</span>
        </h1>
        <p>{copy.howLead}</p>
      </div>

      <div className="explain-grid">
        <article className="explain-step">
          <div className="step-label">
            <span>{copy.step1Label}</span>
            <span>{copy.step1Meta}</span>
          </div>
          <figure className="explain-art sensory-art">
            <div className="pixel-monitor">
              <div className="monitor-head">
                <i />
                <i />
                <i />
              </div>
              {/* Sensory frame is a demo seed PNG, not a layout-critical LCP photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={chartUrl} width={320} height={180} alt={copy.latestFrame} />
              <div className="monitor-stand" />
            </div>
            <div className="pixel-eye">
              <svg viewBox="0 0 108 104" aria-hidden="true" shapeRendering="crispEdges">
                {Array.from({ length: 6 }).flatMap((_, row) =>
                  Array.from({ length: 7 }).map((__, col) => {
                    const colors = ["#61adff", "#445369", "#bdff32", "#bdff32", "#61adff", "#61adff", "#445369"];
                    return (
                      <rect
                        key={`${row}-${col}`}
                        x={12 + col * 12}
                        y={18 + row * 12}
                        width="8"
                        height="8"
                        fill={colors[col]}
                      />
                    );
                  }),
                )}
              </svg>
              <span>{copy.step1Proxy}</span>
            </div>
            <figcaption>{copy.step1Caption}</figcaption>
          </figure>
          <h2>{copy.step1Title}</h2>
          <p>{copy.step1Body}</p>
        </article>

        <article className="explain-step">
          <div className="step-label">
            <span>{copy.step2Label}</span>
            <span>{copy.step2Meta}</span>
          </div>
          <figure className="explain-art">
            <svg
              viewBox="0 0 440 210"
              role="img"
              aria-label={copy.step2Caption}
              shapeRendering="crispEdges"
            >
              <g fill="none" stroke="#353c4e" strokeWidth="2">
                <path d="M50 55H105V30H150M50 100H85V75H150M50 145H105V120H150M150 30H195V80H230M150 75H195V125H230M150 120H180V165H230M230 80H280V40H330M230 125H290V105H330M230 165H290V150H330M330 40H380V95H405M330 105H405M330 150H380V105" />
              </g>
              <g fill="none" stroke="#bdff32" strokeWidth="3">
                <path d="M50 100H85V75H150M150 75H195V125H230M230 125H290V105H330M330 105H405" />
              </g>
              {(
                [
                  [42, 47, false],
                  [42, 92, true],
                  [42, 137, false],
                  [142, 22, false],
                  [142, 67, true],
                  [142, 112, false],
                  [222, 72, false],
                  [222, 117, true],
                  [222, 157, false],
                  [322, 32, false],
                  [322, 97, true],
                  [322, 142, false],
                  [397, 92, true],
                ] as const
              ).map(([x, y, on], i) => (
                <g key={i}>
                  <rect x={x} y={y} width="16" height="16" fill={on ? "#bdff32" : "#b5bdd0"} />
                  <rect x={x + 5} y={y + 5} width="6" height="6" fill="#080b12" />
                </g>
              ))}
              <path
                d="M72 192h60v-18h6v30h6v-12h51v-18h6v30h6v-12h65"
                fill="none"
                stroke="#61adff"
                strokeWidth="2"
              />
              <text x="302" y="197" fill="#8e98ac" fontSize="11" fontFamily="monospace">
                SPIKES
              </text>
            </svg>
            <figcaption>{copy.step2Caption}</figcaption>
          </figure>
          <h2>{copy.step2Title}</h2>
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
            <svg viewBox="0 0 440 210" role="img" aria-label={copy.step3Caption} shapeRendering="crispEdges">
              <text x="26" y="28" fill="#9099ad" fontSize="11" fontFamily="monospace">
                FIXED NEURAL READOUT
              </text>
              <g fill="#101820" stroke="#526078" strokeWidth="2">
                <path d="M27 50h106v52H27zM165 50h106v52H165zM303 50h106v52H303z" />
              </g>
              <text x="80" y="81" textAnchor="middle" fill="#bdff32" fontSize="16" fontFamily="Silkscreen, monospace">
                BUY
              </text>
              <text x="218" y="81" textAnchor="middle" fill="#ff4b78" fontSize="16" fontFamily="Silkscreen, monospace">
                SELL
              </text>
              <text x="356" y="81" textAnchor="middle" fill="#bdc5d4" fontSize="16" fontFamily="Silkscreen, monospace">
                HOLD
              </text>
              <path d="M80 102v23h68v19M218 102v23h-70M356 102v42" fill="none" stroke="#526078" strokeWidth="2" />
              <path d="M26 144h245v45H26z" fill="#1e2a13" stroke="#bdff32" strokeWidth="2" />
              <text x="148" y="164" textAnchor="middle" fill="#bdff32" fontSize="11" fontFamily="monospace">
                POSITION MANAGER
              </text>
              <text x="148" y="179" textAnchor="middle" fill="#9da58f" fontSize="11" fontFamily="monospace">
                CASH / UNITS / LIMITS
              </text>
              <path d="M303 144h106v45H303z" fill="#151923" stroke="#526078" strokeWidth="2" />
              <text x="356" y="171" textAnchor="middle" fill="#bdc5d4" fontSize="12" fontFamily="Silkscreen, monospace">
                PAPER
              </text>
            </svg>
            <figcaption>{copy.step3Caption}</figcaption>
          </figure>
          <h2>{copy.step3Title}</h2>
          <p>{copy.step3Body}</p>
        </article>

        <article className="explain-step">
          <div className="step-label">
            <span>{copy.step4Label}</span>
            <span>{copy.step4Meta}</span>
          </div>
          <figure className="explain-art">
            <svg viewBox="0 0 440 210" role="img" aria-label={copy.step4Caption} shapeRendering="crispEdges">
              <text x="24" y="24" fill="#bdff32" fontSize="11" fontFamily="monospace">
                PORTFOLIO GAIN
              </text>
              <text x="261" y="24" fill="#ff4b78" fontSize="11" fontFamily="monospace">
                PORTFOLIO LOSS
              </text>
              <path d="M28 79h30V63h30V47h43" fill="none" stroke="#bdff32" strokeWidth="4" />
              <path d="M265 47h30v16h30v16h43" fill="none" stroke="#ff4b78" strokeWidth="4" />
              {Array.from({ length: 15 }).map((_, i) => (
                <rect
                  key={i}
                  x={31 + (i % 5) * 15}
                  y={94 + Math.floor(i / 5) * 12}
                  width="8"
                  height="8"
                  fill="#bdff32"
                />
              ))}
              <rect x="286" y="100" width="18" height="18" fill="#ff4b78" />
              <rect x="318" y="100" width="18" height="18" fill="#ff4b78" />
              <text x="32" y="146" fill="#b6c6a4" fontSize="11" fontFamily="monospace">
                15 PAM11
              </text>
              <text x="275" y="146" fill="#ce9eab" fontSize="11" fontFamily="monospace">
                2 PPL101
              </text>
              <path d="M127 110h68v68m70-68h-45v68M160 182h116" fill="none" stroke="#65708b" strokeWidth="2" />
              <rect x="177" y="70" width="78" height="25" fill="#161e2d" />
              <text x="216" y="87" textAnchor="middle" fill="#61adff" fontSize="11" fontFamily="monospace">
                200 ms
              </text>
            </svg>
            <figcaption>{copy.step4Caption}</figcaption>
          </figure>
          <h2>{copy.step4Title}</h2>
          <p>{copy.step4Body}</p>
        </article>
      </div>

      <div className="explain-note">
        <span className="note-icon" aria-hidden="true">
          ?
        </span>
        <div>
          <h2>{copy.disclaimerTitle}</h2>
          <p>{copy.disclaimerBody}</p>
          <p>{copy.disclaimerWorker}</p>
          <p>{copy.disclaimerPoll}</p>
        </div>
      </div>

      <a className="return-link" href="#watch">
        {copy.returnToFly} <span aria-hidden="true">→</span>
      </a>
    </main>
  );
}
