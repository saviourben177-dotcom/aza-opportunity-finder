import { CalendarClock, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import type { AnalysisResult, OpportunityMatch } from '@workspace/api-client-react';
import DashboardShell from '@/components/dashboard-shell';

type EligFilter = 'all' | OpportunityMatch['eligibility'];

export default function OpportunitiesList() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [elig, setElig] = useState<EligFilter>('all');
  const [type, setType] = useState('all');
  const [freeOnly, setFreeOnly] = useState(false);
  const [noTravel, setNoTravel] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('aza-analysis');
    if (saved) {
      try {
        setResult(JSON.parse(saved) as AnalysisResult);
      } catch {
        setResult(null);
      }
    }
  }, []);

  const types = useMemo(() => {
    const set = new Set<string>();
    result?.matches.forEach((m) => set.add(m.category));
    return Array.from(set);
  }, [result]);

  const visible = useMemo(() => {
    return (result?.matches ?? []).filter((m) => {
      if (elig !== 'all' && m.eligibility !== elig) return false;
      if (type !== 'all' && m.category !== type) return false;
      if (freeOnly && m.applicationCost > 0) return false;
      if (noTravel && !m.onlineAvailability) return false;
      return true;
    });
  }, [result, elig, type, freeOnly, noTravel]);

  const reset = () => {
    setElig('all');
    setType('all');
    setFreeOnly(false);
    setNoTravel(false);
  };

  return (
    <DashboardShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Opportunities</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result ? `${visible.length} of ${result.total} opportunities` : 'Build a profile to see matches.'}
          </p>

          {!result && (
            <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white p-10 text-center">
              <p className="text-sm text-muted-foreground">No profile analysis yet.</p>
              <Link href="/profile" data-testid="link-build-profile-list-empty" className="mt-4 inline-block rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-bold text-white">
                Build your profile
              </Link>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {visible.map((item) => (
              <Link
                key={item.id}
                href={`/opportunities/${item.id}`}
                data-testid={`link-opportunity-list-${item.id}`}
                className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-white p-4 transition hover:border-[hsl(var(--primary))]/30"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-xs font-bold text-muted-foreground">
                  {item.organization.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-foreground">{item.title}</p>
                    <span className="shrink-0 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {item.category}
                    </span>
                    {item.demoData && (
                      <span className="shrink-0 rounded-full bg-[hsl(32_95%_95%)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(32_95%_40%)]">
                        Demo data
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{item.onlineAvailability ? 'Online' : 'In-person'}</span>
                    <span className="flex items-center gap-1">
                      <CalendarClock size={11} />
                      {item.daysRemaining < 0 ? 'Closed' : `${item.daysRemaining} days left`}
                    </span>
                    <span>{item.applicationCost === 0 ? 'Free' : `$${item.applicationCost}`}</span>
                  </div>
                </div>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-[hsl(var(--primary))] text-xs font-extrabold text-[hsl(var(--primary))]">
                  {Math.round(item.score)}%
                </div>
              </Link>
            ))}
            {result && visible.length === 0 && (
              <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-10 text-center">
                <Search size={20} className="mx-auto text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold text-foreground">No matches for these filters</p>
                <p className="mt-1 text-xs text-muted-foreground">Try clearing a filter.</p>
              </div>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-foreground">Filters</p>
            <button type="button" data-testid="button-reset-filters" onClick={reset} className="flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))]">
              <RotateCcw size={11} /> Reset
            </button>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Eligibility</p>
            <div className="mt-2 space-y-1.5">
              {(['all', 'eligible', 'potential', 'ineligible'] as EligFilter[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  data-testid={`button-filter-elig-${v}`}
                  onClick={() => setElig(v)}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                    elig === v ? 'bg-[hsl(var(--primary))] text-white' : 'text-muted-foreground hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  {v === 'all' ? 'All' : v === 'eligible' ? 'Eligible' : v === 'potential' ? 'Potentially eligible' : 'Not eligible'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Opportunity type</p>
            <select
              data-testid="select-filter-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-[hsl(var(--primary))]"
            >
              <option value="all">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Free only</span>
              <input
                type="checkbox"
                data-testid="checkbox-free-only"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="h-4 w-8 accent-[hsl(var(--primary))]"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Online only</span>
              <input
                type="checkbox"
                data-testid="checkbox-no-travel"
                checked={noTravel}
                onChange={(e) => setNoTravel(e.target.checked)}
                className="h-4 w-8 accent-[hsl(var(--primary))]"
              />
            </label>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}
