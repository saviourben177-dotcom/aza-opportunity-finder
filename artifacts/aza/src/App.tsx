import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import MarketingNav from '@/components/marketing-nav';
import NotFound from '@/pages/not-found';
import MarketingHome from '@/pages/marketing-home';
import ProfileWizard from '@/pages/profile-wizard';
import DashboardHome from '@/pages/dashboard-home';
import OpportunitiesList from '@/pages/opportunities-list';
import OpportunityDetail from '@/pages/opportunity-detail';
import Saved from '@/pages/saved';
import Applications from '@/pages/applications';
import AiMatch from '@/pages/ai-match';
import Resources from '@/pages/resources';
import Settings from '@/pages/settings';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import './index.css';

const queryClient = new QueryClient();

const marketingPaths = new Set(['/']);

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  const [location] = useLocation();
  const isMarketing = marketingPaths.has(location);

  return (
    <div className="min-h-[100dvh] bg-white">
      {isMarketing && <MarketingNav />}
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={MarketingHome} />
          <Route path="/profile" component={ProfileWizard} />
          <Route path="/dashboard" component={DashboardHome} />
          <Route path="/opportunities" component={OpportunitiesList} />
          <Route path="/opportunities/:id" component={OpportunityDetail} />
          <Route path="/saved" component={Saved} />
          <Route path="/applications" component={Applications} />
          <Route path="/ai-match" component={AiMatch} />
          <Route path="/resources" component={Resources} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </div>
  );
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
