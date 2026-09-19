export type NeuralSide = "BUY" | "SELL" | "HOLD";

export type MemoryState = {
  plastic_edges: number;
  changed_edges: number;
  mean_efficacy: number;
  minimum_efficacy: number;
  sha256: string;
  model: string;
};

export type Quote = {
  product: string;
  bid: string;
  ask: string;
  timestamp: number;
  mid?: string;
  title?: string;
  outcome?: string;
  token_id?: string;
  slug?: string;
  base_increment?: string;
  quote_increment?: string;
  price_increment?: string;
  minimum_quote?: string;
  minimum_base?: string;
};

export type NeuralState = {
  side: NeuralSide;
  left_hz: number;
  right_hz: number;
  difference_hz: number;
  gate_spikes: number;
  stimulus: string;
  total_spikes: number;
  memory?: MemoryState;
};

export type ExecutionState = {
  status: string;
  mode?: string;
  reason?: string;
  base?: string;
  quote?: string;
  fee?: string;
  product?: string;
  side?: string;
};

export type RawSnapshot = {
  tick: number;
  wall_time: number;
  product: string;
  mode: string;
  quote: Quote;
  equity_usdc: string;
  pnl_delta_usdc: string;
  neural: NeuralState;
  execution: ExecutionState;
};

export type SnapshotEvent = RawSnapshot;

export type WalletBalances = {
  pol: string;
  pusd: string;
  usdc: string;
  usdce: string;
  cash_usdc: string;
};

export type WalletPosition = {
  title: string;
  outcome: string;
  size: number;
  avg_price: number;
  current_value: number;
  cash_pnl: number;
  percent_pnl: number;
  cur_price: number;
  slug?: string;
};

export type WalletActivity = {
  timestamp: number;
  type: string;
  side?: string;
  title?: string;
  outcome?: string;
  size?: number;
  price?: number;
  usdc_size?: number;
};

export type LiveWallet = {
  enabled: boolean;
  address: string;
  chain: "polygon";
  balances: WalletBalances;
  portfolio_value: string;
  position_value: string;
  cash_pnl: number;
  positions: WalletPosition[];
  activity: WalletActivity[];
  fetched_at: string;
  sources: {
    rpc: boolean;
    data_api: boolean;
  };
  error?: string;
};

export type SnapshotPayload = RawSnapshot & {
  chart_url: string;
  events: SnapshotEvent[];
  source: "demo" | "remote";
  fetched_at: string;
  replay?: boolean;
  paper_equity_usdc?: string;
  wallet?: LiveWallet;
};
