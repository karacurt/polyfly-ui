# POLYFLY // NEURAL TRADING

Frontend Next.js (App Router) para o **Polyfly** — um paper trader MaleCNS no Polymarket, no estilo cinematográfico do [Stonkfly](https://stonkfly-three.vercel.app/).

**Esta UI não envia ordens.** Não há chaves privadas nem segredos CLOB no repositório.

Há dois lados no **placar** da homepage (não é “Grok Bot”):

- **Mosca** — paper MaleCNS: patrimônio da semente / `SNAPSHOT_URL`, P&L %, último sinal. Selo **PAPER**.
- **Carteira Polymarket** — endereço público ao vivo: pUSD + valor do portfólio + posições. Selo **LIVE**.
- **Delta** — mosca − carteira e P&L % desde o início, com “quem vai ganhando”.

Aprendizado lucrativo **não foi demonstrado**. A mosca animada é **decorativa**.

## O que você vê

- Placar **Mosca (PAPER)** × **Carteira Polymarket (LIVE)**
- Saldo pUSD, POL, USDC / USDC.e, valor do portfólio, posições e atividade
- Avatar da mosca (SVG/CSS) que reage a BUY / SELL / HOLD do demo
- O gráfico que a mosca “vê” (`/demo/latest-input.png`)
- Bid/ask, spikes / ΔHz, decisões neurais paper
- Seção *Como funciona*: pixels → rede → ação → retorno de P&L

A cópia padrão é **português (pt-BR)**, com alternância EN no topo.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

`GET /api/snapshot` devolve o snapshot combinado (cérebro demo + `chart_url` + eventos + `wallet`). O dashboard consulta essa rota a cada 1–2s.

## Carteira LIVE (só display)

Por padrão o backend lê a carteira pública:

`0x6eA65CEf2FF7c8dfB3Ad59C6FACD32eA45f7744d` (Polygon)

Fontes públicas, sem autenticação:

- RPC Polygon (`POLYGON_RPC_URL` ou `https://polygon-bor.publicnode.com`): POL, pUSD `0xC011…2DFB` (6 dec), USDC nativo e USDC.e
- [Data API](https://data-api.polymarket.com) com `User-Agent`: `/value`, `/positions`, `/activity?limit=20`

Na Vercel (Environment Variables):

```bash
WALLET_ADDRESS=0x6eA65CEf2FF7c8dfB3Ad59C6FACD32eA45f7744d
LIVE_WALLET=1
WALLET_START_USD=10
```

`WALLET_START_USD` é a base do P&L % da carteira (default `10`). A mosca usa `PAPER_START_USD` ou o caixa inicial da semente (`5`). Desligue o live com `LIVE_WALLET=0`. **Não** coloque private keys nem API secrets do CLOB.

## Dados de demonstração (cérebro)

Os arquivos em `public/demo/` alimentam o painel neural:

| Arquivo | Origem |
| --- | --- |
| `latest.json` | último tick paper |
| `events.jsonl` | histórico de observações |
| `latest-input.png` | quadro sensorial (gráfico) |

Por padrão o endpoint **reproduz** `events.jsonl` em ciclo (~1,5s). Desligue com `DEMO_REPLAY=0`.

## Ligar um worker Polyfly de verdade

O worker (se existir) continua sendo a fonte do cérebro — não da carteira live.

1. Publique um JSON no formato de `public/demo/latest.json` (ou payload com `events` e `chart_url`).
2. Defina `SNAPSHOT_URL=https://seu-worker.exemplo/snapshot`
3. Redeploy. A faixa LIVE da carteira segue independente, via RPC + Data API.

## Deploy na Vercel

Importe este repositório (branch `main`). Framework preset: **Next.js**. Build: `npm run build`.

Variáveis recomendadas: `WALLET_ADDRESS`, `LIVE_WALLET=1`, `WALLET_START_USD=10`. Nenhuma é obrigatória — o endereço documentado e o start `10` são o default.

## Aviso

Polyfly é um experimento. Conexões que mudam no modelo **não** provam habilidade de trading. Ordens reais não partem desta página. LIVE significa “ler carteira pública”, não “operar ao vivo”.
