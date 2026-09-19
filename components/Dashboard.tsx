"use client";

import { useEffect, useMemo, useState } from "react";
import { ConsciousnessPanel } from "@/components/ConsciousnessPanel";
import { FlyAvatar } from "@/components/FlyAvatar";
import { Header } from "@/components/Header";
import { HowItWorks } from "@/components/HowItWorks";
import { NeuronField } from "@/components/NeuronField";
import { Scoreboard } from "@/components/Scoreboard";
import {
  formatClock,
  formatHz,
  formatInt,
  formatPrice,
  formatSignedUsdc,
  formatPol,
  formatUsdc,
  formatWeth,
  relativeAge,
  shortAddress,
  signClass,
  splitEquity,
} from "@/lib/format";
import { copy } from "@/lib/i18n";
import type { NeuralSide, SnapshotPayload } from "@/lib/types";

const POLL_MS = 1500;

function sideClass(side?: string): "buy" | "sell" | "" {
  if (side === "BUY") return "buy";
  if (side === "SELL") return "sell";
  return "";
}

function stimulusCopy(stimulus: string | undefined): string {
  if (stimulus === "reward") return copy.stimulusReward;
  if (stimulus === "aversive") return copy.stimulusAversive;
  return copy.stimulusNone;
}

export function Dashboard({ initial }: { initial: SnapshotPayload }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [connected, setConnected] = useState(true);
  const [motion, setMotion] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const [tab, setTab] = useState<"wallet" | "events">(() =>
    initial.wallet?.activity?.length ? "wallet" : "events",
  );

  const side = (snapshot.neural?.side ?? "HOLD") as NeuralSide;
  const wallet = snapshot.wallet?.enabled ? snapshot.wallet : undefined;
  const liveEquity = splitEquity(snapshot.equity_usdc);
  const paperEquity = splitEquity(snapshot.paper_equity_usdc ?? snapshot.equity_usdc);
  const livePnl = wallet ? wallet.cash_pnl : snapshot.pnl_delta_usdc;

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

  const events = useMemo(
    () => [...(snapshot.events ?? [])].sort((a, b) => b.tick - a.tick),
    [snapshot.events],
  );

  const positionLabel = snapshot.execution?.base
    ? `${Number(snapshot.execution.base).toFixed(2)} YES`
    : copy.noPosition;

  const freshness = relativeAge(snapshot.fetched_at);
  void now;

  return (
    <div className="site-shell">
      <Header live={Boolean(wallet)} />

      <main id="watch" tabIndex={-1} aria-label="Polyfly dashboard">
        <section className="hero" aria-label="Decorative fly over a living FlyWire-style connectome">
          <NeuronField
            neural={snapshot.neural}
            consciousness={snapshot.consciousness}
            motion={motion}
          />
          <div className="hero-controls">
            <span>
              <b className={`live-dot ${connected ? "on" : ""}`} />
              {connected ? copy.neuralPaper : copy.connecting}
            </span>
            <button
              type="button"
              aria-pressed={!motion}
              onClick={() => setMotion((value) => !value)}
            >
              {motion ? copy.pauseMotion : copy.resumeMotion}
            </button>
          </div>
          <div className={`hero-fly fly-rig ${side} ${motion ? "motion" : "paused"}`}>
            <FlyAvatar
              side={side}
              motion={motion}
              intensity={Math.min(
                1,
                Math.max(
                  snapshot.consciousness?.ci ?? 0.2,
                  Math.abs(snapshot.neural?.difference_hz ?? 0) / 12,
                ),
              )}
            />
          </div>
          <div className="hero-copy">
            <p className="eyebrow">{copy.heroEyebrow}</p>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroLead}</p>
          </div>
          <aside className="hero-readout" aria-label={copy.neuralOrder}>
            <small>
              {copy.neuralOrder} · {copy.paper}
            </small>
            <b className={sideClass(side)}>{side}</b>
            <small>
              {copy.spikes} {formatInt(snapshot.neural?.total_spikes)} · {copy.leftHz}{" "}
              {formatHz(snapshot.neural?.left_hz)} / {copy.rightHz}{" "}
              {formatHz(snapshot.neural?.right_hz)}
            </small>
            <small>{stimulusCopy(snapshot.neural?.stimulus)}</small>
          </aside>
        </section>

        <ConsciousnessPanel mind={snapshot.consciousness} />

        {snapshot.scoreboard ? <Scoreboard board={snapshot.scoreboard} /> : null}

        <section className="data-row" aria-label="Wallet and paper brain">
          <article className="glass-card" aria-label={copy.liveWallet}>
            <div className="account-title">
              <h2>{copy.bagTitle}</h2>
              {wallet ? (
                <span className="live-badge" title={copy.liveWallet}>
                  <i aria-hidden="true" />
                  {copy.live}
                </span>
              ) : (
                <span className="paper-badge" title={copy.paperNeverLive}>
                  <i aria-hidden="true" />
                  {copy.paper}
                </span>
              )}
            </div>
            <div className="balance-label">
              {copy.totalValue} <span>{copy.currency}</span>
            </div>
            <div className="value">
              {liveEquity.whole}
              <span className="cents">{liveEquity.cents}</span>
            </div>
            <div className="pnl-row">
              <div>
                <small>{copy.netPnl}</small>{" "}
                <span className={signClass(livePnl)}>
                  {formatSignedUsdc(livePnl)} {copy.currency}
                </span>
              </div>
              <small>{wallet ? copy.valuationLive : copy.valuationAge}</small>
            </div>

            <div className="stat-grid">
              {wallet ? (
                <>
                  <div className="stat-card">
                    <span>{copy.liveCash}</span>
                    <strong>{formatUsdc(wallet.balances.pusd)}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{copy.liveValue}</span>
                    <strong>{formatUsdc(wallet.position_value)}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{copy.livePol}</span>
                    <strong>{formatPol(wallet.balances.pol)}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{copy.liveUsdce}</span>
                    <strong>{formatUsdc(wallet.balances.usdce)}</strong>
                  </div>
                  <div className="stat-card">
                    <span>{copy.liveWeth}</span>
                    <strong>{formatWeth(wallet.balances.weth)}</strong>
                  </div>
                  <div className="stat-card">
                    <span>
                      {copy.livePrice} · {copy.liveVenue}
                    </span>
                    <strong>
                      {wallet.weth_price_usdce
                        ? `${formatUsdc(wallet.weth_price_usdce)} USDC.e`
                        : "—"}
                    </strong>
                  </div>
                  <div className="stat-card wide">
                    <span>
                      {copy.liveAddress} · {copy.watchingWallet}
                    </span>
                    <strong title={wallet.address}>{shortAddress(wallet.address)}</strong>
                  </div>
                </>
              ) : null}
            </div>

            <section className="holdings">
              <h3>
                {wallet ? copy.livePositions : copy.currentlyHolding}
                <span>
                  {wallet ? `${wallet.positions.length}` : (snapshot.execution?.status ?? "HOLD")}
                </span>
              </h3>
              {wallet ? (
                wallet.positions.length ? (
                  <div className="holding-grid">
                    {wallet.positions.map((pos) => (
                      <div className="holding" key={`${pos.slug ?? pos.title}-${pos.outcome}`}>
                        <div className="coin">
                          <div className="coin-icon">Ξ</div>
                          <div>
                            <strong>{pos.outcome || pos.title}</strong>
                            <small>{pos.title}</small>
                          </div>
                        </div>
                        <div className="holding-value">
                          <strong>{formatUsdc(pos.current_value)}</strong>
                          <small className={signClass(pos.cash_pnl)}>
                            {formatSignedUsdc(pos.cash_pnl)} · {formatWeth(pos.size)} @{" "}
                            {formatUsdc(pos.cur_price)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty">{copy.liveNoPositions}</p>
                )
              ) : (
                <p className="empty">{positionLabel}</p>
              )}
            </section>
          </article>

          <article className="glass-card" aria-label={copy.neuralPaper}>
            <div className="brain-title">
              <h2>{copy.brainTitle}</h2>
              <span className="paper-badge" title={copy.paperNeverLive}>
                <i aria-hidden="true" />
                {copy.paper}
              </span>
            </div>
            <div className="balance-label">{copy.paperEquity}</div>
            <div className="value">
              {paperEquity.whole}
              <span className="cents">{paperEquity.cents}</span>
            </div>
            <div className="pnl-row">
              <div>
                <small>{copy.netPnl}</small>{" "}
                <span className={signClass(snapshot.pnl_delta_usdc)}>
                  {formatSignedUsdc(snapshot.pnl_delta_usdc)} {copy.currency}
                </span>
              </div>
              <small>{copy.executionPaper}</small>
            </div>
            <div className="stat-grid">
              <div className="stat-card">
                <span>{copy.tick}</span>
                <strong>{snapshot.tick}</strong>
              </div>
              <div className="stat-card">
                <span>{copy.neuralOrder}</span>
                <strong className={sideClass(side)}>{side}</strong>
              </div>
              <div className="stat-card">
                <span>{copy.bidAsk}</span>
                <strong>
                  {formatPrice(snapshot.quote?.bid)} / {formatPrice(snapshot.quote?.ask)}
                </strong>
              </div>
              <div className="stat-card">
                <span>
                  {copy.spikes} / {copy.deltaHz}
                </span>
                <strong>
                  {formatInt(snapshot.neural?.total_spikes)} /{" "}
                  {formatHz(snapshot.neural?.difference_hz)}
                </strong>
              </div>
              <div className="stat-card">
                <span>
                  {copy.leftHz} / {copy.rightHz}
                </span>
                <strong>
                  {formatHz(snapshot.neural?.left_hz)} / {formatHz(snapshot.neural?.right_hz)}
                </strong>
              </div>
              <div className="stat-card">
                <span>{copy.memoryChanged}</span>
                <strong>{formatInt(snapshot.neural?.memory?.changed_edges)}</strong>
              </div>
              <div className="stat-card">
                <span>{copy.meanEfficacy}</span>
                <strong>
                  {snapshot.neural?.memory?.mean_efficacy != null
                    ? snapshot.neural.memory.mean_efficacy.toFixed(3)
                    : "—"}
                </strong>
              </div>
              <div className="stat-card">
                <span>{copy.neurons}</span>
                <strong>166,700</strong>
              </div>
              <div className="stat-card wide">
                <span>
                  {copy.market} · {snapshot.quote?.outcome ?? "Yes"} · {copy.neuralPaper}
                </span>
                <strong>{snapshot.quote?.title ?? snapshot.product}</strong>
              </div>
            </div>
            <div className={`brain-decision ${side}`}>
              <span className="eyebrow">
                {copy.neuralOrder} · {copy.paper}
              </span>
              <div>
                <b>{side}</b>
                <span>
                  {copy.gate} {snapshot.neural?.gate_spikes ?? 0} · {copy.deltaHz}{" "}
                  {formatHz(snapshot.neural?.difference_hz)}
                </span>
              </div>
              <p>{stimulusCopy(snapshot.neural?.stimulus)}</p>
            </div>
          </article>
        </section>

        <section className="observe" aria-label={copy.observeTitle}>
          <article className="glass-card">
            <div className="observe-head">
              <h2>{copy.whatFlySees}</h2>
              <span>{copy.latestFrame}</span>
            </div>
            <div className="chart-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snapshot.chart_url}
                alt={copy.whatFlySees}
                width={320}
                height={180}
              />
            </div>
            <p className="chart-caption">{copy.orbitHint}</p>
          </article>

          <article className="glass-card">
            <div className="activity-head">
              <div className="tabs" role="tablist" aria-label={copy.events}>
                {wallet ? (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === "wallet"}
                    onClick={() => setTab("wallet")}
                  >
                    {copy.liveActivity} <span>{wallet.activity.length}</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "events"}
                  onClick={() => setTab("events")}
                >
                  {copy.decisions} <span>{events.length}</span>
                </button>
              </div>
              <span>
                {copy.eventCount} {snapshot.tick}
              </span>
            </div>
            <div role="tabpanel">
              {tab === "wallet" && wallet ? (
                wallet.activity.length === 0 ? (
                  <p className="empty">{copy.liveNoActivity}</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>{copy.colTime}</th>
                        <th>{copy.colType}</th>
                        <th>{copy.colSize}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wallet.activity.map((row, index) => (
                        <tr key={`${row.timestamp}-${row.type}-${index}`}>
                          <td>
                            {formatClock(row.timestamp)}
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
                              ? formatUsdc(row.usdc_size)
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
                <p className="empty">{copy.emptyEvents}</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>{copy.colTime}</th>
                      <th>{copy.colSignal}</th>
                      <th>{copy.colEquity}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.tick}>
                        <td>
                          {formatClock(event.wall_time)}
                          <small>
                            {copy.tick} {event.tick}
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
                          {formatUsdc(event.equity_usdc)}
                          <small className={signClass(event.pnl_delta_usdc)}>
                            {formatSignedUsdc(event.pnl_delta_usdc)}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </article>
        </section>

        <HowItWorks chartUrl={snapshot.chart_url} />
      </main>

      <footer className="site-footer">
        <span className={`connection ${connected ? "online" : ""}`}>
          <i />
          <span>
            {!connected
              ? copy.footerOffline
              : snapshot.source === "remote"
                ? copy.footerRemote
                : copy.footerDemo}
          </span>
        </span>
        <span>
          {wallet ? copy.footerLive : copy.paper} · {freshness}
        </span>
        <span>{wallet ? copy.footerPaperBrain : copy.footerPaper}</span>
      </footer>
    </div>
  );
}
