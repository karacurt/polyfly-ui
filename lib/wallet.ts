import type {
  LiveWallet,
  WalletActivity,
  WalletBalances,
  WalletPosition,
} from "@/lib/types";

export const DEFAULT_WALLET_ADDRESS =
  "0x6eA65CEf2FF7c8dfB3Ad59C6FACD32eA45f7744d";

export const PUSD = "0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB";
export const USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
export const USDCE = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
export const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

const QUICKSWAP_WETH_USDCE = "0x853Ee4b2A13f8a742d64C8F088bE7bA2131f670d";
const USER_AGENT =
  "Polyfly-UI/1.0 (display-only DEX wallet tracker; https://github.com/karacurt/polyfly-ui)";

const RPC_CANDIDATES = [
  process.env.POLYGON_RPC_URL,
  "https://polygon-bor.publicnode.com",
  "https://polygon-rpc.com",
].filter((url): url is string => Boolean(url?.trim()));

const CACHE_MS = 1600;
let cache: { at: number; wallet: LiveWallet } | null = null;

const BALANCE_OF = "0x70a08231";
const GET_RESERVES = "0x0902f1ac";

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

function emptyBalances(): WalletBalances {
  return { pol: "0", pusd: "0", usdc: "0", usdce: "0", weth: "0", cash_usdc: "0" };
}

function priceFromReserves(hex: string): number | undefined {
  if (!hex || hex === "0x" || hex.length < 130) return undefined;
  try {
    const reserve0 = BigInt(`0x${hex.slice(2, 66)}`);
    const reserve1 = BigInt(`0x${hex.slice(66, 130)}`);
    if (reserve0 === ZERO || reserve1 === ZERO) return undefined;
    const usdce = Number(reserve0) / 1e6;
    const weth = Number(reserve1) / 1e18;
    if (!usdce || !weth) return undefined;
    const price = usdce / weth;
    return Number.isFinite(price) && price > 100 && price < 100_000 ? price : undefined;
  } catch {
    return undefined;
  }
}

async function fetchOnchain(address: string): Promise<{
  balances: WalletBalances;
  wethPrice?: number;
}> {
  const data = paddedBalanceData(address);
  const calls = [
    { method: "eth_getBalance", params: [address, "latest"] },
    { method: "eth_call", params: [{ to: PUSD, data }, "latest"] },
    { method: "eth_call", params: [{ to: USDC, data }, "latest"] },
    { method: "eth_call", params: [{ to: USDCE, data }, "latest"] },
    { method: "eth_call", params: [{ to: WETH, data }, "latest"] },
    { method: "eth_call", params: [{ to: QUICKSWAP_WETH_USDCE, data: GET_RESERVES }, "latest"] },
  ];

  let lastError: unknown;
  for (const url of RPC_CANDIDATES) {
    try {
      const [pol, pusd, usdc, usdce, weth, reserves] = await rpcBatch(url, calls);
      const balances: WalletBalances = {
        pol: hexToDecimal(pol, 18),
        pusd: hexToDecimal(pusd, 6),
        usdc: hexToDecimal(usdc, 6),
        usdce: hexToDecimal(usdce, 6),
        weth: hexToDecimal(weth, 18),
        cash_usdc: "0",
      };
      balances.cash_usdc = addDecimal(
        addDecimal(balances.pusd, balances.usdc),
        balances.usdce,
      );
      return { balances, wethPrice: priceFromReserves(reserves) };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("rpc failed");
}

async function fetchDexscreenerPrice(): Promise<number | undefined> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${WETH}`,
      {
        headers: { accept: "application/json", "user-agent": USER_AGENT },
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!response.ok) return undefined;
    const json: unknown = await response.json();
    if (!isRecord(json) || !Array.isArray(json.pairs)) return undefined;
    const polygon = json.pairs
      .filter(isRecord)
      .filter((row) => String(row.chainId) === "polygon")
      .map((row) => Number(isRecord(row.priceUsd) ? row.priceUsd : row.priceNative))
      .filter((n) => Number.isFinite(n) && n > 100);
    return polygon[0];
  } catch {
    return undefined;
  }
}

async function fetchParaswapPrice(): Promise<number | undefined> {
  try {
    const amount = "1000000000000000";
    const url =
      `https://apiv5.paraswap.io/prices?srcToken=${WETH}&destToken=${USDCE}` +
      `&amount=${amount}&srcDecimals=18&destDecimals=6&side=SELL&network=137`;
    const response = await fetch(url, {
      headers: { accept: "application/json", "user-agent": USER_AGENT },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return undefined;
    const json: unknown = await response.json();
    const dest =
      isRecord(json) && isRecord(json.priceRoute)
        ? Number(json.priceRoute.destAmount)
        : NaN;
    if (!Number.isFinite(dest) || dest <= 0) return undefined;
    return dest / 1e6 / 0.001;
  } catch {
    return undefined;
  }
}

function wethCostUsdce(): number {
  const n = Number(process.env.WETH_COST_USDCE ?? process.env.WETH_COST_USD);
  return Number.isFinite(n) && n > 0 ? n : 2.8;
}

function buildWethPosition(
  wethSize: number,
  price: number | undefined,
): { positions: WalletPosition[]; activity: WalletActivity[]; positionValue: number; cashPnl: number } {
  if (!Number.isFinite(wethSize) || wethSize < 1e-6) {
    return { positions: [], activity: [], positionValue: 0, cashPnl: 0 };
  }
  const cost = wethCostUsdce();
  const value = price && price > 0 ? wethSize * price : 0;
  const pnl = value > 0 ? value - cost : 0;
  const avg = wethSize > 0 ? cost / wethSize : 0;
  const pct = cost > 0 && value > 0 ? (pnl / cost) * 100 : 0;
  const positions: WalletPosition[] = [
    {
      title: "WETH/USDC.e · ParaSwap",
      outcome: "WETH long",
      size: wethSize,
      avg_price: avg,
      current_value: value,
      cash_pnl: pnl,
      percent_pnl: pct,
      cur_price: price ?? 0,
      slug: "weth-usdce",
      venue: "paraswap",
    },
  ];
  const activity: WalletActivity[] = [
    {
      timestamp: Date.now() / 1000,
      type: "OPEN_SCALP",
      side: "BUY",
      title: "WETH/USDC.e",
      outcome: "ParaSwap",
      size: wethSize,
      price: avg || undefined,
      usdc_size: cost,
    },
  ];
  return { positions, activity, positionValue: value, cashPnl: pnl };
}

async function fetchLiveWalletUncached(address: string): Promise<LiveWallet> {
  const fetchedAt = new Date().toISOString();
  const sources = { rpc: false, price: false };
  const errors: string[] = [];
  let balances = emptyBalances();
  let wethPrice: number | undefined;

  try {
    const onchain = await fetchOnchain(address);
    balances = onchain.balances;
    wethPrice = onchain.wethPrice;
    sources.rpc = true;
    if (wethPrice) sources.price = true;
  } catch {
    errors.push("rpc");
  }

  if (!wethPrice) {
    const [dex, para] = await Promise.all([fetchDexscreenerPrice(), fetchParaswapPrice()]);
    wethPrice = dex ?? para;
    if (wethPrice) sources.price = true;
    else errors.push("price");
  }

  const wethSize = Number(balances.weth);
  const { positions, activity, positionValue, cashPnl } = buildWethPosition(wethSize, wethPrice);
  const portfolio = addDecimal(balances.cash_usdc, positionValue.toFixed(6));

  return {
    enabled: true,
    address,
    chain: "polygon",
    venue: "paraswap",
    pair: "WETH/USDC.e",
    balances,
    portfolio_value: portfolio,
    position_value: positionValue.toFixed(6).replace(/\.?0+$/, "") || "0",
    cash_pnl: cashPnl,
    weth_price_usdce: wethPrice ? wethPrice.toFixed(2) : undefined,
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
    return {
      enabled: true,
      address,
      chain: "polygon",
      venue: "paraswap",
      pair: "WETH/USDC.e",
      balances: emptyBalances(),
      portfolio_value: "0",
      position_value: "0",
      cash_pnl: 0,
      positions: [],
      activity: [],
      fetched_at: new Date().toISOString(),
      sources: { rpc: false, price: false },
      error: error instanceof Error ? error.message : "wallet fetch failed",
    };
  }
}
