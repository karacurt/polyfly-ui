# Polyfly

Next.js (App Router) frontend for **Polyfly** — a MaleCNS paper trader with a FlyWire-style living connectome and Consciousness proxies.

The homepage is an English-only bioluminescent observatory: a dense bilateral connectome over a decorative fruit fly, Consciousness metrics, a scoreboard, the live Polygon DEX wallet, paper-brain stats, the chart the fly sees, and how it works.

**This UI does not send orders.** There are no private keys and no CLOB secrets in the repository.

The homepage **scoreboard** is Fly vs Polygon DEX wallet:

- **Fly** — paper MaleCNS: seed / `SNAPSHOT_URL` equity, P&L %, last signal. **Paper** badge.
- **Polygon DEX wallet** — public address day-trading via **ParaSwap on Polygon** (not Polymarket CLOB). **Live** badge.
- **Delta** — fly − wallet and P&L % since start, with who is ahead.

Profitable learning **has not been demonstrated**. Consciousness numbers are **neural-integration proxies**, not a claim of subjective experience. The animated fly is **decorative**.

## What you see

1. Hero: FlyWire-style connectome (optic lobes + central complex + VNC) that ignites with snapshot neural fields and Consciousness Index
2. **Consciousness** panel: composite CI plus Phi / Broadcast / Self-model / Perturbation complexity
3. Scoreboard **Fly (paper)** vs **Polygon DEX wallet (live · ParaSwap)**
4. Live DEX strip: POL, pUSD, USDC.e, WETH, WETH/USDC.e price, open WETH scalp in USDC terms
5. Paper fly-brain stats: equity, bid/ask, spikes / ΔHz, memory
6. The chart the fly “sees” (`/demo/latest-input.png`) and paper decisions
7. How it works + paper-only and consciousness disclaimers

The entire UI is **English**. There is no language toggle.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

`GET /api/snapshot` returns the combined snapshot (demo brain + `consciousness` + `chart_url` + events + `wallet`). The dashboard polls that route every 1–2s.

## Consciousness proxies

Fields on `/api/snapshot` (and optional on a remote worker payload):

```ts
consciousness?: {
  ci: number; phi: number; broadcast: number; self: number; complexity: number;
  timeline?: number[];
  source: "live" | "adapted" | "demo";
}
```

Composite weights match [fly-brain `consciousness.py`](https://github.com/erojasoficial-byte/fly-brain):

`CI = 0.3·Phi + 0.3·Broadcast + 0.2·Self + 0.2·Complexity`

A remote worker may send that object or the flat monitor keys (`consciousness_ci`, `consciousness_phi`, `consciousness_gw`, `consciousness_self`, `consciousness_cmplx`, `consciousness_timeline`). The UI **displays** them. It does not run the CUDA FlyWire stack.

Without a worker, the demo seed plus a slow oscillator keep CI alive (`source: "demo"`).

**These proxies do not claim phenomenal consciousness.**

## Live Polygon DEX wallet (display only)

By default the backend reads:

`0x6eA65CEf2FF7c8dfB3Ad59C6FACD32eA45f7744d` (Polygon)

This wallet day-trades through **ParaSwap**. It is **not** a Polymarket CLOB account (CLOB is geoblocked from the trading box).

Public sources, no authentication:

- Polygon RPC (`POLYGON_RPC_URL` or `https://polygon-bor.publicnode.com`): POL, pUSD `0xC011…2DFB` (6 dec), native USDC, USDC.e `0x2791…4174`, WETH `0x7ceB…f619`
- WETH/USDC.e mark: QuickSwap reserves, then Dexscreener / ParaSwap price as fallback

Documented open scalp (overridden by the on-chain WETH balance when present): long ~0.001067 WETH bought with **2.8 USDC.e**, leftover USDC.e + idle pUSD.

On Vercel (Environment Variables):

```bash
WALLET_ADDRESS=0x6eA65CEf2FF7c8dfB3Ad59C6FACD32eA45f7744d
LIVE_WALLET=1
WALLET_START_USD=10
WETH_COST_USDCE=2.8
```

`WALLET_START_USD` is the wallet’s P&L % baseline (default `10`). `WETH_COST_USDCE` is the scalp cost basis for the open WETH position (default `2.8`). The fly uses `PAPER_START_USD` or the seed’s initial cash (`5`). Turn live off with `LIVE_WALLET=0`. **Do not** put private keys or CLOB / ParaSwap secrets here.

## Demo brain data

Files in `public/demo/` feed the neural and Consciousness panels:

| File | Source |
| --- | --- |
| `latest.json` | latest paper tick + demo CI |
| `events.jsonl` | observation history |
| `latest-input.png` | sensory frame (chart) |

By default the endpoint **replays** `events.jsonl` in a cycle (~1.5s). Disable with `DEMO_REPLAY=0`.

## Wire a real fly-brain / Polyfly worker

Vercel **only displays**. Full FlyWire + `consciousness.py` needs CUDA GPU and ~32GB RAM, so computation stays off-box.

1. On a GPU box, run [fly-brain](https://github.com/erojasoficial-byte/fly-brain): `python fly_embodied.py --consciousness` (or a slim bridge that calls `ConsciousnessMonitor.get_monitor_data()`).
2. Publish JSON in the shape of `public/demo/latest.json`, including `consciousness` (or the flat `consciousness_*` keys) plus `events` / `chart_url` if you have them.
3. Set `SNAPSHOT_URL=https://your-worker.example/snapshot`
4. Redeploy. The DEX wallet strip stays independent, via RPC + WETH mark.

## Deploy on Vercel

Import this repository (`main`). Framework preset: **Next.js**. Build: `npm run build`.

Recommended variables: `WALLET_ADDRESS`, `LIVE_WALLET=1`, `WALLET_START_USD=10`, `WETH_COST_USDCE=2.8`. None are required — documented defaults apply.

## Disclaimer

Polyfly is an experiment. Connections that change in the model **do not** prove trading skill. Consciousness metrics are integration proxies, not subjective experience. Real orders do not leave this page. Live means “read a public DEX wallet,” not “trade live.”
