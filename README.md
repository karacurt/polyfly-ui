# Polyfly

Next.js (App Router) frontend for **Polyfly** — a MaleCNS paper trader watching Polymarket.

The homepage is an English-only bioluminescent observatory: a large decorative fruit fly over a live-feeling neuron field, then a scoreboard, the live wallet, paper-brain stats, the chart the fly sees, and how it works.

**This UI does not send orders.** There are no private keys and no CLOB secrets in the repository.

The homepage **scoreboard** is Fly vs Polymarket wallet (not “Grok Bot”):

- **Fly** — paper MaleCNS: seed / `SNAPSHOT_URL` equity, P&L %, last signal. **Paper** badge.
- **Polymarket wallet** — public live address: pUSD + portfolio value + positions. **Live** badge.
- **Delta** — fly − wallet and P&L % since start, with who is ahead.

Profitable learning **has not been demonstrated**. The animated fly is **decorative**.

## What you see

1. Hero: large decorative fly over a canvas neuron field driven by snapshot neural fields (`total_spikes`, `left_hz` / `right_hz`, `difference_hz`, side, stimulus, memory `changed_edges` / `mean_efficacy`)
2. Scoreboard **Fly (paper)** vs **Polymarket wallet (live)**
3. Live wallet strip: pUSD, POL, USDC / USDC.e, portfolio, positions
4. Paper fly-brain stats: equity, bid/ask, spikes / ΔHz, memory
5. The chart the fly “sees” (`/demo/latest-input.png`) and paper decisions
6. How it works: pixels → network → action → P&L feedback, plus paper-only disclaimers

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

`GET /api/snapshot` returns the combined snapshot (demo brain + `chart_url` + events + `wallet`). The dashboard polls that route every 1–2s.

## Live wallet (display only)

By default the backend reads the public wallet:

`0x6eA65CEf2FF7c8dfB3Ad59C6FACD32eA45f7744d` (Polygon)

Public sources, no authentication:

- Polygon RPC (`POLYGON_RPC_URL` or `https://polygon-bor.publicnode.com`): POL, pUSD `0xC011…2DFB` (6 dec), native USDC and USDC.e
- [Data API](https://data-api.polymarket.com) with `User-Agent`: `/value`, `/positions`, `/activity?limit=20`

On Vercel (Environment Variables):

```bash
WALLET_ADDRESS=0x6eA65CEf2FF7c8dfB3Ad59C6FACD32eA45f7744d
LIVE_WALLET=1
WALLET_START_USD=10
```

`WALLET_START_USD` is the wallet’s P&L % baseline (default `10`). The fly uses `PAPER_START_USD` or the seed’s initial cash (`5`). Turn live off with `LIVE_WALLET=0`. **Do not** put private keys or CLOB API secrets here.

## Demo brain data

Files in `public/demo/` feed the neural panel:

| File | Source |
| --- | --- |
| `latest.json` | latest paper tick |
| `events.jsonl` | observation history |
| `latest-input.png` | sensory frame (chart) |

By default the endpoint **replays** `events.jsonl` in a cycle (~1.5s). Disable with `DEMO_REPLAY=0`.

## Wire a real Polyfly worker

The worker (if it exists) remains the source of the brain — not the live wallet.

1. Publish JSON in the shape of `public/demo/latest.json` (or a payload that already includes `events` and `chart_url`).
2. Set `SNAPSHOT_URL=https://your-worker.example/snapshot`
3. Redeploy. The live wallet strip stays independent, via RPC + Data API.

## Deploy on Vercel

Import this repository (`main`). Framework preset: **Next.js**. Build: `npm run build`.

Recommended variables: `WALLET_ADDRESS`, `LIVE_WALLET=1`, `WALLET_START_USD=10`. None are required — the documented address and start `10` are the defaults.

## Disclaimer

Polyfly is an experiment. Connections that change in the model **do not** prove trading skill. Real orders do not leave this page. Live means “read a public wallet,” not “trade live.”
