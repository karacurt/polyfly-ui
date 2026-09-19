"use client";

import { formatSignedUsdc, formatUsdc, shortAddress, signClass } from "@/lib/format";
import type { Copy, Locale } from "@/lib/i18n";
import type { Scoreboard as ScoreboardData } from "@/lib/types";

function formatPct(value: number | undefined, locale: Locale): string {
  if (!Number.isFinite(value)) return "—";
  const n = value as number;
  const body = Math.abs(n).toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (n > 0) return `+${body}%`;
  if (n < 0) return `−${body}%`;
  return `${body}%`;
}

function sideClass(side?: string): "buy" | "sell" | "" {
  if (side === "BUY") return "buy";
  if (side === "SELL") return "sell";
  return "";
}

type ScoreboardProps = {
  board: ScoreboardData;
  copy: Copy;
  locale: Locale;
};

export function Scoreboard({ board, copy, locale }: ScoreboardProps) {
  const fly = board.fly;
  const wallet = board.wallet;
  const delta = board.delta;
  const leader =
    delta?.leader === "fly"
      ? copy.scoreLeaderFly
      : delta?.leader === "wallet"
        ? copy.scoreLeaderWallet
        : copy.scoreLeaderTie;

  return (
    <section className="scoreboard" aria-label={copy.scoreTitle}>
      <div className="score-head">
        <h2>{copy.scoreTitle}</h2>
        <span>{copy.scoreHint}</span>
      </div>
      <div className="score-grid">
        <article className="score-card fly">
          <div className="score-card-top">
            <span className="eyebrow">{copy.scoreFly}</span>
            <span className="paper-badge" title={copy.paperNeverLive}>
              <i aria-hidden="true" />
              {copy.paper}
            </span>
          </div>
          <strong className="score-equity">{formatUsdc(fly.equity, locale)}</strong>
          <div className="score-meta">
            <span className={signClass(fly.pnl)}>
              {formatSignedUsdc(fly.pnl, locale)} · {formatPct(fly.pnl_percent, locale)}
            </span>
            <span>
              {copy.scoreStart} {formatUsdc(fly.start, locale)}
            </span>
          </div>
          <div className="score-signal">
            <small>{copy.scoreSignal}</small>
            <b className={sideClass(fly.signal)}>{fly.signal ?? "HOLD"}</b>
          </div>
        </article>

        <article className="score-card delta">
          <div className="score-card-top">
            <span className="eyebrow">{copy.scoreDelta}</span>
          </div>
          <strong className={`score-equity ${signClass(delta?.equity)}`}>
            {delta ? formatSignedUsdc(delta.equity, locale) : "—"}
          </strong>
          <div className="score-meta">
            <span className={signClass(delta?.pnl_percent)}>
              {formatPct(delta?.pnl_percent, locale)}
            </span>
            <span>{copy.scoreVsStart}</span>
          </div>
          <p className={`score-leader ${delta?.leader ?? "tie"}`}>{leader}</p>
        </article>

        <article className="score-card wallet">
          <div className="score-card-top">
            <span className="eyebrow">{copy.scoreWallet}</span>
            <span className="live-badge" title={copy.liveWallet}>
              <i aria-hidden="true" />
              {copy.live}
            </span>
          </div>
          <strong className="score-equity">
            {wallet ? formatUsdc(wallet.equity, locale) : "—"}
          </strong>
          <div className="score-meta">
            <span className={signClass(wallet?.pnl)}>
              {wallet
                ? `${formatSignedUsdc(wallet.pnl, locale)} · ${formatPct(wallet.pnl_percent, locale)}`
                : "—"}
            </span>
            <span>
              {copy.liveCash} {wallet ? formatUsdc(wallet.cash_pusd, locale) : "—"}
            </span>
          </div>
          <div className="score-signal">
            <small>
              {copy.livePositions} {wallet?.positions ?? 0} · {copy.liveValue}{" "}
              {wallet ? formatUsdc(wallet.position_value, locale) : "—"}
            </small>
            <b>{wallet ? shortAddress(wallet.address) : "—"}</b>
          </div>
        </article>
      </div>
    </section>
  );
}
