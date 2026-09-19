import type {
  LiveWallet,
  WalletActivity,
  WalletBalances,
  WalletPosition,
} from "@/lib/types";

export const DEFAULT_WALLET_ADDRESS =
  "0x6eA65CEf2FF7c8dfB3Ad59C6FACD32eA45f7744d";

const DATA_API = "https://data-api.polymarket.com";
const USER_AGENT =
  "Polyfly-UI/1.0 (display-only wallet tracker; https://github.com/karacurt/polyfly-ui)";

const PUSD = "0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB";
const USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const USDCE = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

const RPC_CANDIDATES = [
  process.env.POLYGON_RPC_URL,
  "https://polygon-bor.publicnode.com",
  "https://polygon-rpc.com",
].filter((url): url is string => Boolean(url?.trim()));

const CACHE_MS = 1600;
let cache: { at: number; wallet: LiveWallet } | null = null;

const BALANCE_OF = "0x70a08231";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function normalizeAddress(value: string | undefined): string | null {
  const raw = (value ?? DEFAULT_WALLET_ADDRESS).trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) return null;
  return raw;
}

export function liveWalletEnabled(): boolean {
  const flag = process.env.LIVE_WALLET?.trim().toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off") return false;
  if (flag === "1" || flag === "true" || flag === "on") return true;
  return Boolean(process.env.WALLET_ADDRESS?.trim() || DEFAULT_WALLET_ADDRESS);
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const ZERO = BigInt(0);
const ONE = BigInt(1);
const NEG = BigInt(-1);
const MILLION = BigInt(1_000_000);

function hexToDecimal(hex: string | undefined, decimals: number): string {
  if (!hex || hex === "0x") return "0";
  try {
    const raw = BigInt(hex);
    const base = BigInt(10) ** BigInt(decimals);
    const whole = raw / base;
    const frac = raw % base;
    if (frac === ZERO) return whole.toString();
    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
    return `${whole.toString()}.${fracStr}`;
  } catch {
    return "0";
  }
}

function addDecimal(a: string, b: string): string {
  const toScaled = (value: string) => {
    const [w, f = ""] = value.split(".");
    const frac = (f + "000000").slice(0, 6);
    const sign = w.startsWith("-") ? NEG : ONE;
    const whole = BigInt((w.startsWith("-") ? w.slice(1) : w) || "0");
    return sign * (whole * MILLION + BigInt(frac));
  };
  const sum = toScaled(a) + toScaled(b);
  const sign = sum < ZERO ? "-" : "";
  const abs = sum < ZERO ? -sum : sum;
  const whole = abs / MILLION;
  const frac = (abs % MILLION).toString().padStart(6, "0").replace(/0+$/, "");
  return frac ? `${sign}${whole}.${frac}` : `${sign}${whole}`;
}

function paddedBalanceData(address: string): string {
  return `${BALANCE_OF}${address.slice(2).toLowerCase().padStart(64, "0")}`;
}

async function rpcBatch(
  url: string,
  calls: { method: string; params: unknown[] }[],
): Promise<string[]> {
  const body = calls.map((call, id) => ({
    jsonrpc: "2.0",
    id,
    method: call.method,
    params: call.params,
  }));
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(3500),
  });
  if (!response.ok) throw new Error(`rpc ${response.status}`);
  const json: unknown = await response.json();
  const rows = Array.isArray(json) ? json : [json];
  return rows
    .slice()
    .sort((a, b) => Number(isRecord(a) ? a.id : 0) - Number(isRecord(b) ? b.id : 0))
    .map((row) => {
      if (!isRecord(row) || typeof row.result !== "string") {
        throw new Error("rpc missing result");
      }
      return row.result;
    });
}

async function fetchBalances(address: string): Promise<WalletBalances> {
  const data = paddedBalanceData(address);
  const calls = [
    { method: "eth_getBalance", params: [address, "latest"] },
    { method: "eth_call", params: [{ to: PUSD, data }, "latest"] },
    { method: "eth_call", params: [{ to: USDC, data }, "latest"] },
    { method: "eth_call", params: [{ to: USDCE, data }, "latest"] },
  ];

  let lastError: unknown;
  for (const url of RPC_CANDIDATES) {
    try {
      const [pol, pusd, usdc, usdce] = await rpcBatch(url, calls);
      const balances: WalletBalances = {
        pol: hexToDecimal(pol, 18),
        pusd: hexToDecimal(pusd, 6),
        usdc: hexToDecimal(usdc, 6),
        usdce: hexToDecimal(usdce, 6),
        cash_usdc: "0",
      };
      balances.cash_usdc = addDecimal(
        addDecimal(balances.pusd, balances.usdc),
        balances.usdce,
      );
      return balances;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("rpc failed");
}

async function dataGet(path: string): Promise<unknown> {
  const response = await fetch(`${DATA_API}${path}`, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) throw new Error(`data-api ${response.status}`);
  return response.json();
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function parsePositions(raw: unknown): WalletPosition[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isRecord).map((row) => ({
    title: asString(row.title) ?? "—",
    outcome: asString(row.outcome) ?? "",
    size: asNumber(row.size),
    avg_price: asNumber(row.avgPrice),
    current_value: asNumber(row.currentValue),
    cash_pnl: asNumber(row.cashPnl),
    percent_pnl: asNumber(row.percentPnl),
    cur_price: asNumber(row.curPrice),
    slug: asString(row.slug) ?? asString(row.eventSlug),
  }));
}

function parseActivity(raw: unknown): WalletActivity[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isRecord).map((row) => ({
    timestamp: asNumber(row.timestamp ?? row.time ?? row.createdAt),
    type: asString(row.type) ?? "UNKNOWN",
    side: asString(row.side),
    title: asString(row.title),
    outcome: asString(row.outcome),
    size: row.size == null ? undefined : asNumber(row.size),
    price: row.price == null ? undefined : asNumber(row.price),
    usdc_size: row.usdcSize == null ? undefined : asNumber(row.usdcSize),
  }));
}

function parseValue(raw: unknown): number {
  if (Array.isArray(raw) && isRecord(raw[0])) return asNumber(raw[0].value);
  if (isRecord(raw)) return asNumber(raw.value);
  return asNumber(raw);
}

async function fetchLiveWalletUncached(address: string): Promise<LiveWallet> {
  const fetchedAt = new Date().toISOString();
  const sources = { rpc: false, data_api: false };
  let balances: WalletBalances = {
    pol: "0",
    pusd: "0",
    usdc: "0",
    usdce: "0",
    cash_usdc: "0",
  };
  let positions: WalletPosition[] = [];
  let activity: WalletActivity[] = [];
  let positionValue = 0;
  const errors: string[] = [];

  const [rpcResult, valueResult, posResult, actResult] = await Promise.allSettled([
    fetchBalances(address),
    dataGet(`/value?user=${address}`),
    dataGet(`/positions?user=${address}&limit=50&sizeThreshold=0&sortBy=CURRENT`),
    dataGet(`/activity?user=${address}&limit=20`),
  ]);

  if (rpcResult.status === "fulfilled") {
    balances = rpcResult.value;
    sources.rpc = true;
  } else {
    errors.push("rpc");
  }

  if (valueResult.status === "fulfilled") {
    positionValue = parseValue(valueResult.value);
    sources.data_api = true;
  } else {
    errors.push("value");
  }

  if (posResult.status === "fulfilled") {
    positions = parsePositions(posResult.value);
    sources.data_api = true;
    if (!positionValue && positions.length) {
      positionValue = positions.reduce((sum, row) => sum + row.current_value, 0);
    }
  } else {
    errors.push("positions");
  }

  if (actResult.status === "fulfilled") {
    activity = parseActivity(actResult.value);
    sources.data_api = true;
  } else {
    errors.push("activity");
  }

  const cashPnl = positions.reduce((sum, row) => sum + row.cash_pnl, 0);
  const portfolio = addDecimal(balances.cash_usdc, positionValue.toFixed(6));

  return {
    enabled: true,
    address,
    chain: "polygon",
    balances,
    portfolio_value: portfolio,
    position_value: positionValue.toFixed(6).replace(/\.?0+$/, "") || "0",
    cash_pnl: cashPnl,
    positions,
    activity,
    fetched_at: fetchedAt,
    sources,
    error: errors.length ? errors.join(",") : undefined,
  };
}

export async function fetchLiveWallet(): Promise<LiveWallet | undefined> {
  if (!liveWalletEnabled()) return undefined;
  const address = normalizeAddress(process.env.WALLET_ADDRESS);
  if (!address) return undefined;

  if (cache && Date.now() - cache.at < CACHE_MS) return cache.wallet;

  try {
    const wallet = await fetchLiveWalletUncached(address);
    cache = { at: Date.now(), wallet };
    return wallet;
  } catch (error) {
    const failed: LiveWallet = {
      enabled: true,
      address,
      chain: "polygon",
      balances: { pol: "0", pusd: "0", usdc: "0", usdce: "0", cash_usdc: "0" },
      portfolio_value: "0",
      position_value: "0",
      cash_pnl: 0,
      positions: [],
      activity: [],
      fetched_at: new Date().toISOString(),
      sources: { rpc: false, data_api: false },
      error: error instanceof Error ? error.message : "wallet fetch failed",
    };
    return failed;
  }
}
