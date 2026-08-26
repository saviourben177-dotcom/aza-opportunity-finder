import { AlertTriangle, CalendarClock, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import type { AiMatchResult, ProfileInput } from '@workspace/api-client-react';
import { useAiMatchOpportunities } from '@workspace/api-client-react';
import DashboardShell from '@/components/dashboard-shell';

export default function AiMatch() {
  const [profile, setProfile] = useState<ProfileInput | null>(null);
  const [result, setResult] = useState<AiMatchResult | null>(null);
  const aiMatch = useAiMatchOpportunities();

  useEffect(() => {
    const saved = sessionStorage.getItem('aza-profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved) as ProfileInput);
      } catch {
        setProfile(null);
      }
    }
  }, []);

  const runMatch = () => {
    if (!profile) return;
    aiMatch.mutate(
      { data: profile },
      { onSuccess: (data) => setResult(data) },
    );
  };

  return (
    <DashboardShell>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-extrabold text-foreground">AI Match</h1>
        <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-bold uppercase text-white">Beta</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        A short, personalized read on your best-fit opportunities, generated from your real profile and Aza&apos;s verified listings only.
      </p>

      {!profile && (
        <div className="mt-6 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white p-10 text-center">
          <p className="text-sm font-semibold text-foreground">Build a profile first</p>
          <p className="mt-1 text-xs text-muted-foreground">AI Match needs your profile to generate a personalized shortlist.</p>
          <Link
            href="/profile"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-xs font-bold text-white"
          >
            Create your profile
          </Link>
        </div>
      )}

      {profile && !result && (
        <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-white p-8 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
            <Sparkles size={18} />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">Ready to generate your matches</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This sends your profile to Aza&apos;s matching engine and asks an AI model to explain your top fits in plain language.
          </p>
          <button
            type="button"
            onClick={runMatch}
            disabled={aiMatch.isPending}
            data-testid="button-run-ai-match"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            <Sparkles size={13} />
            {aiMatch.isPending ? 'Matching…' : 'Find my matches'}
          </button>

          {aiMatch.isError && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-[hsl(0_84%_60%)]/30 bg-[hsl(0_84%_97%)] p-3 text-left">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[hsl(0_84%_50%)]" />
              <p className="text-xs text-[hsl(0_60%_35%)]">
                AI Match couldn&apos;t reach the matching service just now. This usually means it&apos;s temporarily
                unavailable — try again in a moment.
              </p>
            </div>
          )}
        </div>
      )}

      {profile && result && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
                <Sparkles size={15} />
              </span>
              <p className="text-sm leading-relaxed text-foreground">{result.summary}</p>
            </div>
          </div>

          {result.highlights.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white p-8 text-center">
              <p className="text-sm text-muted-foreground">No strong matches yet — try widening your interests or preferred types on your profile.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {result.highlights.map((highlight) => (
                <Link
                  key={highlight.opportunityId}
                  href={`/opportunities/${highlight.opportunityId}`}
                  data-testid={`link-ai-match-highlight-${highlight.opportunityId}`}
                  className="block rounded-2xl border border-[hsl(var(--border))] bg-white p-4 transition hover:border-[hsl(var(--primary))]"
                >
                  <p className="text-sm font-bold text-foreground">{highlight.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{highlight.whyItFits}</p>
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
            <CalendarClock size={12} />
            Generated {new Date(result.generatedAt).toLocaleString()}
          </div>

          <button
            type="button"
            onClick={runMatch}
            disabled={aiMatch.isPending}
            className="text-xs font-bold text-[hsl(var(--primary))] disabled:opacity-60"
          >
            {aiMatch.isPending ? 'Refreshing…' : 'Regenerate'}
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
