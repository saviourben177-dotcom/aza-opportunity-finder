import {
  Bell,
  Bookmark,
  ChevronDown,
  FileText,
  Home,
  ListChecks,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/opportunities', label: 'Opportunities', icon: Search },
  { href: '/ai-match', label: 'AI Match', icon: Sparkles, badge: 'Beta' },
  { href: '/saved', label: 'Saved', icon: Bookmark },
  { href: '/applications', label: 'Applications', icon: ListChecks },
  { href: '/resources', label: 'Resources', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
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

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="flex min-h-screen bg-[hsl(var(--muted))]">
      <aside className="hidden w-60 shrink-0 flex-col bg-[hsl(var(--sidebar))] lg:flex">
        <Link href="/" data-testid="link-logo" className="flex items-center gap-2 px-6 py-6">
          <AzaMark />
          <span className="text-lg font-extrabold text-white">Aza</span>
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const active = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`link-sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-[hsl(var(--primary))] text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={17} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white/70">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-white px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <AzaMark />
            <span className="text-lg font-extrabold text-foreground">Aza</span>
          </Link>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <button
              type="button"
              data-testid="button-notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-[hsl(var(--muted))]"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[hsl(var(--destructive))]" />
            </button>
            <button
              type="button"
              data-testid="button-account-menu"
              className="flex items-center gap-2 rounded-full pl-1 pr-2 transition hover:bg-[hsl(var(--muted))]"
            >
              <span className="h-8 w-8 rounded-full bg-[hsl(var(--accent))]" />
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-6 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
