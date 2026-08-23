import { ChevronDown, Globe } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const links = [
  { href: '/', label: 'Home' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/ai-match', label: 'AI Match' },
  { href: '/saved', label: 'Saved' },
  { href: '/resources', label: 'Resources' },
  { href: '/about', label: 'About' },
];

function AzaMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="24" height="24" rx="6" fill="hsl(var(--primary))" />
      <path
        d="M7 9.5C7 8.11929 8.11929 7 9.5 7H14.5C15.8807 7 17 8.11929 17 9.5C17 10.8807 15.8807 12 14.5 12H9.5C8.11929 12 7 13.1193 7 14.5C7 15.8807 8.11929 17 9.5 17H14.5C15.8807 17 17 15.8807 17 14.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MarketingNav() {
  const [location] = useLocation();
  return (
    <header className="sticky top-0 z-30 bg-[hsl(var(--sidebar))]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" data-testid="link-logo" className="flex items-center gap-2">
          <AzaMark />
          <span className="text-lg font-extrabold text-white">Aza</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => {
            const active = l.href === '/' ? location === '/' : location.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                data-testid={`link-nav-${l.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`relative py-1 text-sm font-medium transition ${
                  active ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                {l.label}
                {active && (
                  <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-[hsl(var(--primary))]" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <button
            type="button"
            data-testid="button-language"
            className="hidden items-center gap-1.5 text-sm font-medium text-white/80 sm:flex"
          >
            <Globe size={16} />
            EN
            <ChevronDown size={14} />
          </button>
          <Link
            href="/dashboard"
            data-testid="link-sign-in"
            className="rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95"
          >
            Sign in / Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
