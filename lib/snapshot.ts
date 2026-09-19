import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildScoreboard } from "@/lib/scoreboard";
import type { RawSnapshot, SnapshotEvent, SnapshotPayload } from "@/lib/types";
import { fetchLiveWallet } from "@/lib/wallet";

const DEMO_CHART = "/demo/latest-input.png";
const REPLAY_MS = 1500;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRawSnapshot(value: unknown): value is RawSnapshot {
  if (!isRecord(value)) return false;
  return (
    typeof value.tick === "number" &&
    typeof value.product === "string" &&
    isRecord(value.quote) &&
    isRecord(value.neural) &&
    isRecord(value.execution)
  );
}

function parseEvents(text: string): SnapshotEvent[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as SnapshotEvent)
    .filter(isRawSnapshot)
    .sort((a, b) => a.tick - b.tick);
}

async function readDemoSeed(): Promise<{
  latest: RawSnapshot;
  events: SnapshotEvent[];
}> {
  const demoDir = path.join(process.cwd(), "public", "demo");
  const [latestRaw, eventsRaw] = await Promise.all([
    readFile(path.join(demoDir, "latest.json"), "utf8"),
    readFile(path.join(demoDir, "events.jsonl"), "utf8"),
  ]);
  const latest = JSON.parse(latestRaw) as RawSnapshot;
  const events = parseEvents(eventsRaw);
  return { latest, events: events.length ? events : [latest] };
}

function pickReplay(events: SnapshotEvent[], latest: RawSnapshot): RawSnapshot {
  if (process.env.DEMO_REPLAY === "0") return latest;
  const index = Math.floor(Date.now() / REPLAY_MS) % events.length;
  return events[index] ?? latest;
}

async function withMeta(
  snap: RawSnapshot,
  events: SnapshotEvent[],
  source: SnapshotPayload["source"],
  chartUrl: string,
  replay: boolean,
): Promise<SnapshotPayload> {
  const wallet = await fetchLiveWallet();
  const paperEquity = snap.equity_usdc;
  const liveOk =
    Boolean(wallet?.enabled) &&
    Boolean(wallet?.sources.rpc || wallet?.sources.data_api);
  const liveEquity = liveOk && wallet ? wallet.portfolio_value : paperEquity;

  const scoreboard = buildScoreboard(
    { ...snap, equity_usdc: paperEquity },
    events,
    wallet,
  );

  return {
    ...snap,
    mode: snap.mode || "paper",
    equity_usdc: liveEquity,
    paper_equity_usdc: paperEquity,
    chart_url: chartUrl,
    events,
    source,
    fetched_at: new Date().toISOString(),
    replay,
    wallet,
    scoreboard,
  };
}

function extractRemote(
  data: unknown,
  fallbackEvents: SnapshotEvent[],
): { snap: RawSnapshot; events: SnapshotEvent[]; chartUrl: string } | null {
  if (!isRecord(data)) return null;

  const candidate = isRawSnapshot(data)
    ? data
    : isRawSnapshot(data.latest)
      ? data.latest
      : isRawSnapshot(data.snapshot)
        ? data.snapshot
        : null;
  if (!candidate) return null;

  const events = Array.isArray(data.events)
    ? data.events.filter(isRawSnapshot)
    : fallbackEvents;

  const chartUrl =
    (typeof data.chart_url === "string" && data.chart_url) ||
    (typeof data.chartUrl === "string" && data.chartUrl) ||
    DEMO_CHART;

  return { snap: candidate, events: events.length ? events : [candidate], chartUrl };
}

export async function getSnapshot(): Promise<SnapshotPayload> {
  const { latest, events } = await readDemoSeed();
  const remote = process.env.SNAPSHOT_URL?.trim();

  if (remote) {
    try {
      const response = await fetch(remote, {
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
        headers: { accept: "application/json" },
      });
      if (response.ok) {
        const extracted = extractRemote(await response.json(), events);
        if (extracted) {
          return await withMeta(
            extracted.snap,
            extracted.events,
            "remote",
            extracted.chartUrl,
            false,
          );
        }
      }
    } catch {
      // Fall through to the local demo seed. The UI stays paper-only.
    }
  }

  const current = pickReplay(events, latest);
  const visibleEvents = events.filter((event) => event.tick <= current.tick);
  return await withMeta(
    current,
    visibleEvents.length ? visibleEvents : [current],
    "demo",
    DEMO_CHART,
    process.env.DEMO_REPLAY !== "0",
  );
}
