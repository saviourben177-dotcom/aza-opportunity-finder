import { ArrowRight, CalendarClock, CheckCircle2, CircleAlert, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import type { AnalysisResult } from '@workspace/api-client-react';
import DashboardShell from '@/components/dashboard-shell';

const categoryStyle: Record<string, string> = {
  eligible: 'border-[hsl(var(--primary))]/20 bg-[hsl(var(--accent))]/40',
  potential: 'border-[hsl(32_95%_48%)]/20 bg-[hsl(32_95%_96%)]',
  ineligible: 'border-[hsl(var(--destructive))]/20 bg-[hsl(4_78%_97%)]',
};

export default function DashboardHome() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

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

  const top = result?.matches
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3) ?? [];

  return (
    <DashboardShell>
      <h1 className="text-2xl font-extrabold text-foreground">Good morning 👋</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {result
          ? 'Here are opportunities that match your profile.'
          : 'Build your profile to see opportunities matched to you.'}
      </p>

      {!result && (
        <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white p-8 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t built a profile yet, so there&apos;s nothing to match against.
          </p>
          <Link
            href="/profile"
            data-testid="link-build-profile-empty"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-bold text-white"
          >
            Build your profile
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {result && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className={`rounded-2xl border p-5 ${categoryStyle.eligible}`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[hsl(var(--primary))]" />
                <span className="text-2xl font-extrabold text-foreground">{result.eligibleCount}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">Eligible now</p>
              <p className="text-xs text-muted-foreground">Ready to apply</p>
            </div>
            <div className={`rounded-2xl border p-5 ${categoryStyle.potential}`}>
              <div className="flex items-center gap-2">
                <CircleAlert size={18} className="text-[hsl(32_95%_45%)]" />
                <span className="text-2xl font-extrabold text-foreground">{result.potentialCount}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">Potentially eligible</p>
              <p className="text-xs text-muted-foreground">Needs something</p>
            </div>
            <div className={`rounded-2xl border p-5 ${categoryStyle.ineligible}`}>
              <div className="flex items-center gap-2">
                <XCircle size={18} className="text-[hsl(var(--destructive))]" />
                <span className="text-2xl font-extrabold text-foreground">{result.ineligibleCount}</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-foreground">Not eligible</p>
              <p className="text-xs text-muted-foreground">Doesn&apos;t match</p>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-foreground">Top opportunities for you</h2>
              <Link href="/opportunities" data-testid="link-view-all-opportunities" className="text-xs font-bold text-[hsl(var(--primary))]">
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {top.map((item) => (
                <Link
                  key={item.id}
                  href={`/opportunities/${item.id}`}
                  data-testid={`link-top-opportunity-${item.id}`}
                  className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-white p-4 transition hover:border-[hsl(var(--primary))]/30"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-xs font-bold text-muted-foreground">
                    {item.organization.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-foreground">{item.title}</p>
                      <span className="shrink-0 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {item.category}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{item.onlineAvailability ? 'Online' : 'In-person'}</span>
                      <span className="flex items-center gap-1">
                        <CalendarClock size={11} />
                        {item.daysRemaining < 0 ? 'Closed' : `${item.daysRemaining} days left`}
                      </span>
                      {item.applicationCost === 0 && <span>Free</span>}
                    </div>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-[hsl(var(--primary))] text-xs font-extrabold text-[hsl(var(--primary))]">
                    {Math.round(item.score)}%
                  </div>
                </Link>
              ))}
              {top.length === 0 && (
                <p className="rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-center text-sm text-muted-foreground">
                  No matches yet.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
