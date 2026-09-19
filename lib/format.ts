const LOCALE = "en-US";

export function formatUsdc(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function formatSignedUsdc(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const abs = formatUsdc(Math.abs(n));
  if (n > 0) return `+${abs}`;
  if (n < 0) return `−${abs}`;
  return abs;
}

export function formatHz(value: number | undefined): string {
  if (!Number.isFinite(value)) return "—";
  return Number(value).toLocaleString(LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatInt(value: number | undefined): string {
  if (!Number.isFinite(value)) return "—";
  return Number(value).toLocaleString(LOCALE);
}

export function formatPrice(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export function relativeAge(isoOrEpoch: string | number | undefined): string {
  if (isoOrEpoch == null) return "—";
  const ms =
    typeof isoOrEpoch === "number"
      ? isoOrEpoch > 1e12
        ? isoOrEpoch
        : isoOrEpoch * 1000
      : Date.parse(isoOrEpoch);
  if (!Number.isFinite(ms)) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function formatClock(epoch: number | undefined): string {
  if (!Number.isFinite(epoch)) return "—";
  const ms = (epoch as number) > 1e12 ? (epoch as number) : (epoch as number) * 1000;
  return new Date(ms).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function splitEquity(value: string | number | undefined): {
  whole: string;
  cents: string;
} {
  const n = Number(value);
  if (!Number.isFinite(n)) return { whole: "—", cents: "" };
  const [whole, cents = "00"] = n.toFixed(2).split(".");
  return {
    whole: Number(whole).toLocaleString(LOCALE, { maximumFractionDigits: 0 }),
    cents: `.${cents}`,
  };
}

export function signClass(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "";
  return n > 0 ? "positive" : "negative";
}

export function formatWeth(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  });
}

export function formatPol(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function formatPct(value: number | undefined): string {
  if (!Number.isFinite(value)) return "—";
  const n = value as number;
  const body = Math.abs(n).toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (n > 0) return `+${body}%`;
  if (n < 0) return `−${body}%`;
  return `${body}%`;
}

export function shortAddress(address: string | undefined): string {
  if (!address || address.length < 10) return "—";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
