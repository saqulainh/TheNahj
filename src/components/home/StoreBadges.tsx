const stores = [
  {
    href: "https://play.google.com/store/apps/details?id=in.karbalaconnect.app",
    kicker: "GET IT ON",
    name: "Google Play",
    icon: "play",
  },
  {
    href: "https://apps.apple.com/in/app/karbala-connect/id6781759110",
    kicker: "DOWNLOAD ON THE",
    name: "App Store",
    icon: "apple",
  },
] as const;

function StoreIcon({ type }: { type: "play" | "apple" }) {
  if (type === "apple") {
    return (
      <svg viewBox="0 0 30 34" aria-hidden="true" className="kc-store-icon kc-store-icon--apple">
        <path fill="currentColor" d="M24.77 18.3a4.95 4.95 0 0 1 2.36-4.15 5.07 5.07 0 0 0-3.99-2.16c-1.68-.18-3.31 1-4.17 1s-2.19-.98-3.6-.95a5.32 5.32 0 0 0-4.48 2.73c-1.93 3.35-.49 8.27 1.36 10.98.93 1.32 2.01 2.8 3.43 2.75 1.39-.06 1.9-.88 3.58-.88 1.66 0 2.14.88 3.59.85 1.49-.03 2.43-1.33 3.32-2.67a10.96 10.96 0 0 0 1.52-3.09 4.78 4.78 0 0 1-2.92-4.41ZM22.04 10.21a4.87 4.87 0 0 0 1.11-3.49 4.96 4.96 0 0 0-3.2 1.66 4.64 4.64 0 0 0-1.15 3.36 4.1 4.1 0 0 0 3.24-1.53Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 34 38" aria-hidden="true" className="kc-store-icon">
      <path fill="#34A853" d="M3.4 2.4C2.8 3 2.5 4 2.5 5.2v27.6c0 1.2.3 2.2.9 2.8l15.1-16.6z" />
      <path fill="#4285F4" d="m3.4 2.4 18.1 13.1 5.3-5.8L7.7 1.3C6.1.2 4.5.7 3.4 2.4Z" />
      <path fill="#FBBC04" d="m21.5 21.1 5.3 5.8 4.7-3.4c2.1-1.5 2.1-4 0-5.5l-4.7-3.4z" />
      <path fill="#EA4335" d="m3.4 35.6 18.1-13.1 5.3 5.8L7.7 36.7c-1.6 1.1-3.2.6-4.3-1.1Z" />
    </svg>
  );
}

export function StoreBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`kc-store-links ${className}`}>
      {stores.map((store) => (
        <a key={store.icon} href={store.href} target="_blank" rel="noopener noreferrer" className="kc-store-badge" aria-label={`${store.kicker} ${store.name}`}>
          <StoreIcon type={store.icon} />
          <span className="kc-store-copy">
            <span className="kc-store-kicker">{store.kicker}</span>
            <span className="kc-store-name">{store.name}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
