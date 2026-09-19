import type { Locale } from "@/lib/i18n";

export function formatUsdc(value: string | number | undefined, locale: Locale): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export function formatSignedUsdc(
  value: string | number | undefined,
  locale: Locale,
): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const abs = formatUsdc(Math.abs(n), locale);
  if (n > 0) return `+${abs}`;
  if (n < 0) return `−${abs}`;
  return abs;
}

export function formatHz(value: number | undefined, locale: Locale): string {
  if (!Number.isFinite(value)) return "—";
  return Number(value).toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function formatInt(value: number | undefined, locale: Locale): string {
  if (!Number.isFinite(value)) return "—";
  return Number(value).toLocaleString(locale);
}

export function formatPrice(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(2);
}

export function relativeAge(
  isoOrEpoch: string | number | undefined,
  locale: Locale,
): string {
  if (isoOrEpoch == null) return "—";
  const ms =
    typeof isoOrEpoch === "number"
      ? isoOrEpoch > 1e12
        ? isoOrEpoch
        : isoOrEpoch * 1000
      : Date.parse(isoOrEpoch);
  if (!Number.isFinite(ms)) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (locale === "pt-BR") {
    if (seconds < 60) return `há ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `há ${minutes} min`;
    return `há ${Math.floor(minutes / 60)} h`;
  }
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function formatClock(epoch: number | undefined, locale: Locale): string {
  if (!Number.isFinite(epoch)) return "—";
  const ms = (epoch as number) > 1e12 ? (epoch as number) : (epoch as number) * 1000;
  return new Date(ms).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function splitEquity(
  value: string | number | undefined,
  locale: Locale = "pt-BR",
): {
  whole: string;
  cents: string;
} {
  const n = Number(value);
  if (!Number.isFinite(n)) return { whole: "—", cents: "" };
  const [whole, cents = "00"] = n.toFixed(2).split(".");
  return {
    whole: Number(whole).toLocaleString(locale, { maximumFractionDigits: 0 }),
    cents: `.${cents}`,
  };
}

export function signClass(value: string | number | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return "";
  return n > 0 ? "positive" : "negative";
}
