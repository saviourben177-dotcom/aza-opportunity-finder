import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Results from '@/pages/results';
import OpportunityDetail from '@/pages/opportunity-detail';
import { ArrowRight, CircleHelp, Compass } from 'lucide-react';
import {
  Link,
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import './index.css';

const queryClient = new QueryClient();

function AzaMark() {
  return <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"><Compass size={17} strokeWidth={2.5} /></span>;
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const isHome = location === '/';
  return (
    <div className="aza-grain min-h-[100dvh] overflow-x-hidden">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <Link href="/" data-testid="link-logo" className="group flex items-center gap-2.5">
          <AzaMark />
          <span className="text-lg font-extrabold tracking-[-.05em] text-[hsl(var(--primary))]">aza<span className="text-[hsl(var(--accent-foreground))]">.</span></span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full border bg-[hsl(var(--card))]/60 p-1 text-xs font-bold backdrop-blur">
          <Link href="/" data-testid="link-nav-home" className={`rounded-full px-3 py-2 transition ${isHome ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-muted-foreground hover:text-foreground'}`}>Build a brief</Link>
          <Link href="/results" data-testid="link-nav-results" className={`rounded-full px-3 py-2 transition ${!isHome && location === '/results' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-muted-foreground hover:text-foreground'}`}>Your results</Link>
        </nav>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><CircleHelp size={15} /><span>Specific beats exhaustive.</span></div>
      </header>
      {children}
      <footer className="mx-auto flex max-w-7xl flex-col gap-3 border-t px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <span className="font-mono uppercase tracking-[.14em]">aza / make your next move count</span>
        {!isHome && <Link href="/" data-testid="link-footer-home" className="inline-flex items-center gap-1 font-bold text-[hsl(var(--primary))]">Start over <ArrowRight size={13} /></Link>}
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/results" component={Results} />
          <Route path="/opportunities/:id" component={OpportunityDetail} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
