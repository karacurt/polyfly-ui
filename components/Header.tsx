import { copy } from "@/lib/i18n";

type HeaderProps = {
  live: boolean;
};

export function Header({ live }: HeaderProps) {
  return (
    <header className="top">
      <a className="wordmark" href="#watch" aria-label="Polyfly">
        <svg className="wordmark-fly" viewBox="0 0 44 36" aria-hidden="true">
          <ellipse cx="14" cy="12" rx="11" ry="5" fill="#d7e6f3" opacity="0.35" transform="rotate(-24 14 12)" />
          <ellipse cx="30" cy="12" rx="11" ry="5" fill="#d7e6f3" opacity="0.35" transform="rotate(24 30 12)" />
          <ellipse cx="22" cy="18" rx="6" ry="7" fill="#e8eef8" />
          <circle cx="18" cy="14" r="3.2" fill="#6ee7f5" />
          <circle cx="26" cy="14" r="3.2" fill="#6ee7f5" />
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
        <a className="how-link" href="#how-it-works">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 12h-1.5v-1.5h1.5V14Zm0-3h-1.5V6h1.5v5Z"
              fill="currentColor"
            />
          </svg>
          <span>{copy.howLink}</span>
        </a>
      </div>
    </header>
  );
}
