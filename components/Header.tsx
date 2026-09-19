"use client";

import type { Copy, Locale } from "@/lib/i18n";

type HeaderProps = {
  copy: Copy;
  locale: Locale;
  onLocale: (locale: Locale) => void;
  how: boolean;
  live: boolean;
};

export function Header({ copy, locale, onLocale, how, live }: HeaderProps) {
  return (
    <header className="top">
      <a className="wordmark" href="#watch" aria-label="Polyfly">
        <svg
          className="wordmark-fly"
          viewBox="0 0 44 36"
          aria-hidden="true"
          shapeRendering="crispEdges"
        >
          <path fill="#f3f4ed" d="M8 4h3v2H8zM11 4h3v2h-3zM14 6h3v2h-3zM6 6h3v2H6zM4 10h3v2H4zM17 10h3v2h-3z" />
          <path fill="#bdff32" d="M14 12h8v8h-8zM10 14h4v6h-4z" />
          <path fill="#ff4b78" d="M22 14h6v6h-6z" />
          <path fill="#f3f4ed" d="M12 22h4v3h-4zM20 22h4v3h-4zM8 26h3v3H8zM25 26h3v3h-3z" />
        </svg>
        <span className="wordmark-text">
          <strong>{copy.brand}</strong>
          <span>{copy.brandSub}</span>
        </span>
      </a>
      <div className="top-actions">
        <div className="mode-pair">
          {live ? (
            <span className="live-badge" title={copy.liveWallet}>
              <i aria-hidden="true" />
              {copy.live}
            </span>
          ) : null}
          <span className="paper-badge" title={copy.paperNeverLive}>
            <i aria-hidden="true" />
            {copy.paper}
          </span>
        </div>
        <div className="lang-toggle" role="group" aria-label="Idioma">
          <button
            type="button"
            aria-pressed={locale === "pt-BR"}
            onClick={() => onLocale("pt-BR")}
          >
            {copy.langPt}
          </button>
          <button
            type="button"
            aria-pressed={locale === "en"}
            onClick={() => onLocale("en")}
          >
            {copy.langEn}
          </button>
        </div>
        <a
          className="how-link"
          href={how ? "#watch" : "#how-it-works"}
          aria-current={how ? "page" : undefined}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M3 2h11v2h3v14H3V2Zm2 2v12h10V6h-3V4H5Zm2 4h6v2H7V8Zm0 4h6v2H7v-2Z"
              fill="currentColor"
            />
          </svg>
          <span>{copy.howLink}</span>
        </a>
      </div>
    </header>
  );
}
