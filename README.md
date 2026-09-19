# POLYFLY // NEURAL TRADING

Frontend Next.js (App Router) para o **Polyfly** — um paper trader MaleCNS no Polymarket, no estilo cinematográfico do [Stonkfly](https://stonkfly-three.vercel.app/).

**Paper only. Esta UI nunca finge ser live. Não há chaves, carteiras nem envio de ordens.**

Aprendizado lucrativo **não foi demonstrado**. A mosca animada é **decorativa**.

## O que você vê

- Selo **PAPER** sempre visível
- Avatar da mosca (SVG/CSS) que reage a BUY / SELL / HOLD
- O gráfico que a mosca “vê” (`/demo/latest-input.png`)
- Patrimônio, bid/ask, spikes / ΔHz, eventos recentes
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

`GET /api/snapshot` devolve o snapshot combinado (JSON da semente + `chart_url` + eventos). O dashboard consulta essa rota a cada 1–2s.

## Dados de demonstração (v1)

Os arquivos em `public/demo/` são a semente local:

| Arquivo | Origem |
| --- | --- |
| `latest.json` | último tick paper |
| `events.jsonl` | histórico de observações |
| `latest-input.png` | quadro sensorial (gráfico) |

Por padrão o endpoint **reproduz** `events.jsonl` em ciclo (~1,5s) para a UI parecer viva. Desligue com:

```bash
DEMO_REPLAY=0
```

## Ligar um worker Polyfly de verdade

Esta UI **só lê**. Um worker separado é dono do cérebro e do ledger.

1. Publique um JSON no mesmo formato de `public/demo/latest.json` (ou um payload combinado com `events` e `chart_url`).
2. Defina no host (Vercel → Environment Variables):

```bash
SNAPSHOT_URL=https://seu-worker.exemplo/snapshot
```

3. Redeploy. Se o fetch remoto falhar, a UI volta para a semente demo — ainda em paper.

Não coloque segredos neste frontend. Não habilite trading ao vivo aqui.

## Deploy na Vercel

Importe este repositório (branch `main`). Framework preset: **Next.js**. Build: `npm run build`. Sem variáveis obrigatórias.

## Aviso

Polyfly é um experimento. Conexões que mudam no modelo **não** provam habilidade de trading. Ordens reais não partem desta página.
