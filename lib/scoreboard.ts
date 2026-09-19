import type { LiveWallet, NeuralSide, RawSnapshot, Scoreboard } from "@/lib/types";

const DEFAULT_PAPER_START = 5;
const DEFAULT_WALLET_START = 10;

let firstWalletEquity: number | undefined;

function asFinite(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function envNumber(name: string): number | undefined {
  const n = asFinite(process.env[name]);
  return n !== undefined && n > 0 ? n : undefined;
}

function money(n: number): string {
  return n.toFixed(6).replace(/\.?0+$/, "") || "0";
}

function pnlPercent(current: number, start: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(start) || start === 0) return 0;
  return ((current - start) / start) * 100;
}

export function paperStartEquity(snap: RawSnapshot, events: RawSnapshot[]): number {
  const fromEnv = envNumber("PAPER_START_USD");
  if (fromEnv !== undefined) return fromEnv;

  const field = asFinite(
    (snap as RawSnapshot & { initial_cash?: unknown; initial_equity?: unknown })
      .initial_cash ??
      (snap as RawSnapshot & { initial_equity?: unknown }).initial_equity,
  );
  if (field !== undefined && field > 0) return field;

  const chronological = [...events].sort((a, b) => a.tick - b.tick);
  const first = asFinite(chronological[0]?.equity_usdc);
  if (first !== undefined && first > 0) return first;

  return DEFAULT_PAPER_START;
}

export function walletStartEquity(current: number | undefined): number {
  const fromEnv = envNumber("WALLET_START_USD");
  if (fromEnv !== undefined) return fromEnv;

  if (
    firstWalletEquity === undefined &&
    current !== undefined &&
    Number.isFinite(current) &&
    current > 0
  ) {
    firstWalletEquity = current;
  }
  return firstWalletEquity ?? DEFAULT_WALLET_START;
}

export function buildScoreboard(
  snap: RawSnapshot,
  events: RawSnapshot[],
  wallet: LiveWallet | undefined,
): Scoreboard {
  const flyEquity = asFinite(snap.equity_usdc) ?? 0;
  const flyStart = paperStartEquity(snap, events);
  const flyPnl = flyEquity - flyStart;
  const flyPct = pnlPercent(flyEquity, flyStart);
  const signal = (snap.neural?.side ?? "HOLD") as NeuralSide;

  const fly = {
    label: "mosca" as const,
    mode: "paper" as const,
    equity: money(flyEquity),
    start: money(flyStart),
    pnl: money(flyPnl),
    pnl_percent: flyPct,
    signal,
  };

  if (!wallet?.enabled) {
    return { fly, wallet: null, delta: null };
  }

  const walletEquity = asFinite(wallet.portfolio_value) ?? 0;
  const walletStart = walletStartEquity(walletEquity);
  const walletPnl = walletEquity - walletStart;
  const walletPct = pnlPercent(walletEquity, walletStart);
  const equityDelta = flyEquity - walletEquity;
  const pctDelta = flyPct - walletPct;

  let leader: "fly" | "wallet" | "tie" = "tie";
  if (Math.abs(pctDelta) >= 0.005) {
    leader = pctDelta > 0 ? "fly" : "wallet";
  }

  return {
    fly,
    wallet: {
      label: "polymarket_wallet",
      mode: "live",
      equity: money(walletEquity),
      cash_pusd: wallet.balances.pusd,
      position_value: wallet.position_value,
      positions: wallet.positions.length,
      start: money(walletStart),
      pnl: money(walletPnl),
      pnl_percent: walletPct,
      address: wallet.address,
    },
    delta: {
      equity: money(equityDelta),
      pnl_percent: pctDelta,
      leader,
    },
  };
}
