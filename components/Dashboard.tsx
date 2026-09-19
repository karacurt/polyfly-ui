"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlyAvatar } from "@/components/FlyAvatar";
import { Header } from "@/components/Header";
import { HowItWorks } from "@/components/HowItWorks";
import {
  formatClock,
  formatHz,
  formatInt,
  formatPrice,
  formatSignedUsdc,
  formatPol,
  formatUsdc,
  relativeAge,
  shortAddress,
  signClass,
  splitEquity,
} from "@/lib/format";
import { copy, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import type { NeuralSide, SnapshotPayload } from "@/lib/types";

const POLL_MS = 1500;

function sideClass(side?: string): "buy" | "sell" | "" {
  if (side === "BUY") return "buy";
  if (side === "SELL") return "sell";
  return "";
}

function stimulusCopy(
  stimulus: string | undefined,
  t: (typeof copy)[Locale],
): string {
  if (stimulus === "reward") return t.stimulusReward;
  if (stimulus === "aversive") return t.stimulusAversive;
  return t.stimulusNone;
}

export function Dashboard({ initial }: { initial: SnapshotPayload }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [snapshot, setSnapshot] = useState(initial);
  const [connected, setConnected] = useState(true);
  const [how, setHow] = useState(false);
  const [motion, setMotion] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<"wallet" | "events">("wallet");
  const orbit = useRef({ x: 8, y: -6 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 8, y: -6 });

  const t = copy[locale];
  const side = (snapshot.neural?.side ?? "HOLD") as NeuralSide;
  const wallet = snapshot.wallet?.enabled ? snapshot.wallet : undefined;
  const equity = splitEquity(snapshot.equity_usdc, locale);
  const pnl = wallet ? wallet.cash_pnl : snapshot.pnl_delta_usdc;

  const syncHash = useCallback(() => {
    setHow(window.location.hash === "#how-it-works");
  }, []);

  useEffect(() => {
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [syncHash]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const started = performance.now();
      try {
        const response = await fetch("/api/snapshot", {
          cache: "no-store",
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) throw new Error(String(response.status));
        const next = (await response.json()) as SnapshotPayload;
        if (!cancelled) {
          setSnapshot(next);
          setConnected(true);
        }
      } catch {
        if (!cancelled) setConnected(false);
      } finally {
        const wait = document.hidden
          ? 10000
          : Math.max(200, POLL_MS - (performance.now() - started));
        timer = setTimeout(poll, wait);
      }
    };

    timer = setTimeout(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onDown = (event: PointerEvent) => {
      dragging.current = true;
      last.current = { x: event.clientX, y: event.clientY };
      el.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      const dx = event.clientX - last.current.x;
      const dy = event.clientY - last.current.y;
      last.current = { x: event.clientX, y: event.clientY };
      orbit.current = {
        x: Math.max(-22, Math.min(22, orbit.current.x + dy * 0.2)),
        y: Math.max(-28, Math.min(28, orbit.current.y + dx * 0.2)),
      };
      setTilt({ ...orbit.current });
    };
    const onUp = () => {
      dragging.current = false;
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const events = useMemo(
    () => [...(snapshot.events ?? [])].sort((a, b) => b.tick - a.tick),
    [snapshot.events],
  );

  const positionLabel = snapshot.execution?.base
    ? `${Number(snapshot.execution.base).toFixed(2)} YES`
    : t.noPosition;

  const freshness = relativeAge(snapshot.fetched_at, locale);
  void now;

  return (
    <>
      <Header
        copy={t}
        locale={locale}
        onLocale={setLocale}
        how={how}
        live={Boolean(wallet)}
      />

      {how ? (
        <HowItWorks copy={t} chartUrl={snapshot.chart_url} />
      ) : (
        <main id="watch" className="watch" tabIndex={-1} aria-label="Polyfly dashboard">
          <section className="theater" aria-label="Mosca decorativa no terminal">
            <div className="stage-top">
              <span>
                <b className={`live-dot ${connected ? "on" : ""}`} />
                {t.flyExe}
              </span>
              <button
                type="button"
                aria-pressed={!motion}
                onClick={() => setMotion((value) => !value)}
              >
                {motion ? t.pauseMotion : t.resumeMotion}
              </button>
            </div>
            <div className="scene-wrap">
              <div
                ref={stageRef}
                className="scene-stage"
                aria-label="Avatar decorativo da mosca. Arraste para orbitar."
              >
                <div
                  className="scene-world"
                  style={{
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  }}
                >
                  <svg className="candles" viewBox="0 0 400 120" aria-hidden="true">
                    {Array.from({ length: 22 }).map((_, i) => {
                      const h = 18 + ((i * 17) % 54);
                      const up = i % 3 !== 1;
                      return (
                        <g key={i} transform={`translate(${12 + i * 18} ${90 - h})`}>
                          <rect
                            width="2"
                            height={h + 10}
                            x="4"
                            y="-6"
                            fill={up ? "#3d6a2a" : "#6a2438"}
                          />
                          <rect
                            width="9"
                            height={h * 0.55}
                            y={h * 0.2}
                            fill={up ? "#bdff32" : "#ff4b78"}
                            opacity="0.55"
                          />
                        </g>
                      );
                    })}
                  </svg>
                  <div className={`fly-rig ${side} ${motion ? "motion" : "paused"}`}>
                    <FlyAvatar
                      side={side}
                      motion={motion}
                      intensity={Math.min(1, Math.abs(snapshot.neural?.difference_hz ?? 0) / 12)}
                    />
                  </div>
                  <div className="monitor">
                    <div className="monitor-head">
                      <i />
                      <i />
                      <i />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={snapshot.chart_url}
                      alt={t.whatFlySees}
                      width={320}
                      height={180}
                    />
                    <div className="monitor-label">{t.latestFrame}</div>
                  </div>
                </div>
              </div>
              <div className="scene-caption">
                <small>{t.orbitHint}</small>
              </div>
            </div>
          </section>

          <section className="account" aria-label={wallet ? t.liveWallet : t.bagTitle}>
            <div className="account-title">
              <h1>{t.bagTitle}</h1>
              {wallet ? (
                <span className="live-badge" title={t.liveWallet}>
                  <i aria-hidden="true" />
                  {t.live}
                </span>
              ) : (
                <span className="paper-badge" title={t.paperNeverLive}>
                  <i aria-hidden="true" />
                  {t.paper}
                </span>
              )}
            </div>

            <div className="balance">
              <div className="balance-label">
                {t.totalValue} <span>{t.currency}</span>
              </div>
              <div className="value">
                {equity.whole}
                <span className="cents">{equity.cents}</span>
              </div>
              <div className="pnl-row">
                <div>
                  <small>{t.netPnl}</small>
                  <span className={signClass(pnl)}>
                    {formatSignedUsdc(pnl, locale)} {t.currency}
                  </span>
                </div>
                <small>{wallet ? t.valuationLive : t.valuationAge}</small>
              </div>
            </div>

            <div className="quote-grid">
              {wallet ? (
                <>
                  <div className="stat-card">
                    <span>{t.liveCash}</span>
                    <strong>{formatUsdc(wallet.balances.pusd, locale)}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{t.liveValue}</span>
                    <strong>{formatUsdc(wallet.position_value, locale)}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{t.livePol}</span>
                    <strong>{formatPol(wallet.balances.pol, locale)}</strong>
                  </div>
                  <div className="stat-card">
                    <span>
                      {t.liveUsdc} / {t.liveUsdce}
                    </span>
                    <strong>
                      {formatUsdc(wallet.balances.usdc, locale)} /{" "}
                      {formatUsdc(wallet.balances.usdce, locale)}
                    </strong>
                  </div>
                  <div className="stat-card wide">
                    <span>
                      {t.liveAddress} · {t.watchingWallet}
                    </span>
                    <strong title={wallet.address}>{shortAddress(wallet.address)}</strong>
                  </div>
                </>
              ) : null}
              <div className="stat-card">
                <span>{t.tick}</span>
                <strong>{snapshot.tick}</strong>
              </div>
              <div className="stat-card">
                <span>{t.neuralOrder}</span>
                <strong className={sideClass(side)}>{side}</strong>
              </div>
              <div className="stat-card">
                <span>{t.bidAsk}</span>
                <strong>
                  {formatPrice(snapshot.quote?.bid)} / {formatPrice(snapshot.quote?.ask)}
                </strong>
              </div>
              <div className="stat-card">
                <span>
                  {t.spikes} / {t.deltaHz}
                </span>
                <strong>
                  {formatInt(snapshot.neural?.total_spikes, locale)} /{" "}
                  {formatHz(snapshot.neural?.difference_hz, locale)}
                </strong>
              </div>
              <div className="stat-card wide">
                <span>
                  {t.market} · {snapshot.quote?.outcome ?? "Yes"} · {t.neuralPaper}
                </span>
                <strong>{snapshot.quote?.title ?? snapshot.product}</strong>
              </div>
            </div>

            <section className="holdings">
              <h2>
                {wallet ? t.livePositions : t.currentlyHolding}
                <span>
                  {wallet
                    ? `${wallet.positions.length}`
                    : (snapshot.execution?.status ?? "HOLD")}
                </span>
              </h2>
              {wallet ? (
                wallet.positions.length ? (
                  <div className="holding-grid">
                    {wallet.positions.map((pos) => (
                      <div className="holding" key={`${pos.slug ?? pos.title}-${pos.outcome}`}>
                        <div className="coin">
                          <div className="coin-icon">P</div>
                          <div>
                            <strong>{pos.outcome || pos.title}</strong>
                            <small>{pos.title}</small>
                          </div>
                        </div>
                        <div className="holding-value">
                          <strong>{formatUsdc(pos.current_value, locale)}</strong>
                          <small className={signClass(pos.cash_pnl)}>
                            {formatSignedUsdc(pos.cash_pnl, locale)} · {pos.size.toFixed(2)} @{" "}
                            {pos.cur_price.toFixed(2)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty">{t.liveNoPositions}</p>
                )
              ) : (
                <p className="empty">{positionLabel}</p>
              )}
            </section>

            <section className="activity">
              <div className="activity-source">
                <span>{wallet ? t.executionLive : t.executionPaper}</span>
                {wallet ? <span>{t.neuralPaper}</span> : null}
              </div>
              <div className="activity-head">
                <div role="tablist" aria-label={t.events}>
                  {wallet ? (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === "wallet"}
                      onClick={() => setTab("wallet")}
                    >
                      {t.liveActivity} <span>{wallet.activity.length}</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "events"}
                    onClick={() => setTab("events")}
                  >
                    {t.decisions} <span>{events.length}</span>
                  </button>
                </div>
                <span>
                  {t.eventCount} {snapshot.tick}
                </span>
              </div>
              <div className="activity-panel" role="tabpanel">
                {tab === "wallet" && wallet ? (
                  wallet.activity.length === 0 ? (
                    <p className="empty">{t.liveNoActivity}</p>
                  ) : (
                    <table>
                      <thead>
                        <tr>
                          <th>{t.colTime}</th>
                          <th>{t.colType}</th>
                          <th>{t.colSize}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wallet.activity.map((row, index) => (
                          <tr key={`${row.timestamp}-${row.type}-${index}`}>
                            <td>
                              {formatClock(row.timestamp, locale)}
                              <small>{row.outcome || "—"}</small>
                            </td>
                            <td>
                              <span className={`side ${sideClass(row.side)}`}>
                                {row.side || row.type}
                              </span>
                              <small>{row.title || row.type}</small>
                            </td>
                            <td>
                              {row.usdc_size != null
                                ? formatUsdc(row.usdc_size, locale)
                                : row.size != null
                                  ? row.size.toFixed(2)
                                  : "—"}
                              <small>
                                {row.price != null ? `@ ${row.price.toFixed(2)}` : ""}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )
                ) : events.length === 0 ? (
                  <p className="empty">{t.emptyEvents}</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>{t.colTime}</th>
                        <th>{t.colSignal}</th>
                        <th>{t.colEquity}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.tick}>
                          <td>
                            {formatClock(event.wall_time, locale)}
                            <small>
                              {t.tick} {event.tick}
                            </small>
                          </td>
                          <td>
                            <span className={`side ${sideClass(event.neural.side)}`}>
                              {event.neural.side}
                            </span>
                            <small>
                              {event.execution.status}
                              {event.execution.reason ? ` · ${event.execution.reason}` : ""}
                            </small>
                          </td>
                          <td>
                            {formatUsdc(event.equity_usdc, locale)}
                            <small className={signClass(event.pnl_delta_usdc)}>
                              {formatSignedUsdc(event.pnl_delta_usdc, locale)}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </section>

          <section className="brain-details" aria-label="Atividade neural">
            <div className="brain-bar">
              <div>
                <span>{t.neurons}</span>
                <strong>166,700</strong>
              </div>
              <div>
                <span>{t.spikes}</span>
                <strong>{formatInt(snapshot.neural?.total_spikes, locale)}</strong>
              </div>
              <div>
                <span>
                  {t.leftHz} / {t.rightHz}
                </span>
                <strong>
                  {formatHz(snapshot.neural?.left_hz, locale)} /{" "}
                  {formatHz(snapshot.neural?.right_hz, locale)}
                </strong>
              </div>
              <div>
                <span>{t.memoryChanged}</span>
                <strong>{formatInt(snapshot.neural?.memory?.changed_edges, locale)}</strong>
              </div>
            </div>
            <div className={`decision ${side}`}>
              <span className="eyebrow">
                {t.neuralOrder} · {t.paper}
              </span>
              <div>
                <b>{side}</b>
                <span>
                  {t.gate} {snapshot.neural?.gate_spikes ?? 0} · {t.deltaHz}{" "}
                  {formatHz(snapshot.neural?.difference_hz, locale)}
                </span>
              </div>
              <p>{stimulusCopy(snapshot.neural?.stimulus, t)}</p>
            </div>
          </section>
        </main>
      )}

      <footer className="site">
        <span className={`connection ${connected ? "online" : ""}`}>
          <i />
          <span>
            {!connected
              ? t.footerOffline
              : snapshot.source === "remote"
                ? t.footerRemote
                : t.footerDemo}
          </span>
        </span>
        <span>
          {wallet ? t.footerLive : t.paper} · {freshness}
        </span>
        <span>{wallet ? t.footerPaperBrain : t.footerPaper}</span>
      </footer>
    </>
  );
}
