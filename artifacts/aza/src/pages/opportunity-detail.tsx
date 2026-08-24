import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, Check, CircleAlert, Copy, ExternalLink, FileText, Globe2, RefreshCw, Users, X } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useEffect, useState } from 'react';
import { useGetOpportunity, getGetOpportunityQueryKey, useGetSavedOpportunities, useSaveOpportunity, useUnsaveOpportunity, getGetSavedOpportunitiesQueryKey } from '@workspace/api-client-react';
import type { OpportunityMatch } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import DashboardShell from '@/components/dashboard-shell';
import EligibilityPanel from '@/components/eligibility-panel';
import { getDeviceId } from '@/lib/device-id';

function DetailSkeleton() {
  return (
    <DashboardShell>
      <div className="animate-pulse space-y-5">
        <div className="h-3 w-28 rounded bg-[hsl(var(--muted))]" />
        <div className="h-10 max-w-xl rounded bg-[hsl(var(--muted))]" />
        <div className="h-5 w-64 rounded bg-[hsl(var(--muted))]" />
        <div className="mt-8 h-56 rounded-2xl bg-[hsl(var(--muted))]" />
      </div>
    </DashboardShell>
  );
}

const badgeStyle: Record<OpportunityMatch['eligibility'], string> = {
  eligible: 'bg-[hsl(var(--primary))] text-white',
  potential: 'bg-[hsl(32_95%_48%)] text-white',
  ineligible: 'bg-[hsl(var(--destructive))] text-white',
};

export default function OpportunityDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetOpportunity(id, { query: { enabled: Boolean(id), queryKey: getGetOpportunityQueryKey(id) } });
  const [showApplication, setShowApplication] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedMatch, setSavedMatch] = useState<OpportunityMatch | null>(null);

  const deviceId = getDeviceId();
  const queryClient = useQueryClient();
  const savedListQueryKey = getGetSavedOpportunitiesQueryKey({ deviceId });
  const { data: savedList } = useGetSavedOpportunities(
    { deviceId },
    { query: { enabled: Boolean(deviceId), queryKey: savedListQueryKey } },
  );
  const isSaved = Boolean(savedList?.opportunities.some((item) => item.id === id));

  const saveMutation = useSaveOpportunity({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: savedListQueryKey }) },
  });
  const unsaveMutation = useUnsaveOpportunity({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: savedListQueryKey }) },
  });
  const toggleSaved = () => {
    if (isSaved) {
      unsaveMutation.mutate({ opportunityId: id, data: { deviceId } });
    } else {
      saveMutation.mutate({ data: { deviceId, opportunityId: id } });
    }
  };
  const savePending = saveMutation.isPending || unsaveMutation.isPending;

  useEffect(() => {
    const saved = sessionStorage.getItem('aza-analysis');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as { matches?: OpportunityMatch[] };
      setSavedMatch(parsed.matches?.find((item) => item.id === id) ?? null);
    } catch {
      setSavedMatch(null);
    }
  }, [id]);

  const displayMatch = savedMatch ?? data;
  if (isLoading && !displayMatch) return <DetailSkeleton />;
  if ((isError && !displayMatch) || !displayMatch) {
    return (
      <DashboardShell>
        <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent))]">
            <CircleAlert size={22} className="text-[hsl(var(--primary))]" />
          </span>
          <h1 className="mt-6 text-2xl font-extrabold text-foreground">Couldn&apos;t load this opportunity</h1>
          <p className="mt-2 text-sm text-muted-foreground">It may have moved, or the connection blinked.</p>
          <button
            type="button"
            data-testid="button-retry-opportunity"
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-bold text-white"
          >
            <RefreshCw size={14} /> Try again
          </button>
        </div>
      </DashboardShell>
    );
  }

  const match = displayMatch;
  const deadlineText = match.daysRemaining < 0 ? 'Closed' : match.daysRemaining === 0 ? 'Closes today' : `${match.daysRemaining} days left`;
  const applicationBrief = `Aza application brief: ${match.title}\n\nDocuments to prepare:\n${match.requiredDocuments.map((d) => `- ${d}`).join('\n')}\n\nDeadline: ${match.deadline}`;

  const apply = () => {
    setCopied(false);
    setShowApplication(true);
  };
  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(applicationBrief);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <DashboardShell>
      <Link href="/opportunities" data-testid="link-back-opportunities" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${badgeStyle[match.eligibility]}`}>
              {match.category}
            </span>
            <span className="text-xs text-muted-foreground">{match.organization}</span>
            {match.demoData && (
              <span className="rounded-full bg-[hsl(32_95%_95%)] px-2.5 py-1 text-[10px] font-semibold text-[hsl(32_95%_40%)]">
                Demo data
              </span>
            )}
          </div>
          <h1 data-testid="text-detail-title" className="mt-4 text-3xl font-extrabold leading-tight text-foreground">
            {match.title}
          </h1>

          <div className="mt-5 rounded-2xl border border-[hsl(var(--border))] bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">About</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{match.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[hsl(var(--border))] pt-5 sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Eligibility</p>
                <p className="mt-1 text-xs font-semibold text-foreground">{match.minAge}&ndash;{match.maxAge} years</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Country</p>
                <p className="mt-1 text-xs font-semibold text-foreground">{match.eligibleCountries.slice(0, 2).join(', ')}{match.eligibleCountries.length > 2 ? ' + more' : ''}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Cost to apply</p>
                <p className="mt-1 text-xs font-semibold text-foreground">{match.applicationCost === 0 ? 'Free' : `$${match.applicationCost}`}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Format</p>
                <p className="mt-1 text-xs font-semibold text-foreground">{match.onlineAvailability ? 'Online' : 'In-person'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-extrabold text-foreground">Why this opportunity is a good match for you</h2>
            <div className="mt-4">
              <EligibilityPanel match={match} />
            </div>
          </div>

          {match.missingRequirements.length > 0 && (
            <div className="mt-5 rounded-2xl border border-[hsl(var(--destructive))]/25 bg-[hsl(4_78%_97%)] p-5">
              <div className="flex items-start gap-3">
                <CircleAlert size={17} className="mt-0.5 shrink-0 text-[hsl(var(--destructive))]" />
                <div>
                  <p className="text-sm font-bold text-foreground">What&apos;s missing</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {match.missingRequirements.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar size={13} /> Deadline</span>
              <strong className="text-foreground">{deadlineText}</strong>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Globe2 size={13} /> Format</span>
              <strong className="text-foreground">{match.onlineAvailability ? 'Online' : 'In-person'}</strong>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users size={13} /> Eligible for</span>
              <strong className="text-foreground">{match.studentRequirement}</strong>
            </div>
            <button
              type="button"
              data-testid="button-apply-opportunity"
              onClick={apply}
              disabled={match.daysRemaining < 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              View eligibility <ExternalLink size={14} />
            </button>
            <button
              type="button"
              data-testid="button-toggle-saved"
              onClick={toggleSaved}
              disabled={savePending}
              aria-pressed={isSaved}
              className={`mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isSaved
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--accent))]/40 text-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-foreground hover:bg-[hsl(var(--muted))]'
              }`}
            >
              {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {isSaved ? 'Saved' : 'Save for later'}
            </button>
            {match.demoData && (
              <p className="mt-2.5 text-center text-[10px] leading-relaxed text-muted-foreground">
                Demo data &mdash; this listing is not a real, currently-open opportunity.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-6">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <FileText size={13} /> Documents
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-foreground">
              {match.requiredDocuments.map((d) => <li key={d}>&bull; {d}</li>)}
            </ul>
          </div>
        </aside>
      </div>

      {showApplication && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="application-brief-title">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--primary))]">Application brief</p>
                <h2 id="application-brief-title" className="mt-1.5 text-xl font-extrabold text-foreground">Prepare to apply</h2>
              </div>
              <button type="button" aria-label="Close" onClick={() => setShowApplication(false)} className="rounded-full border border-[hsl(var(--border))] p-2 text-muted-foreground transition hover:bg-[hsl(var(--muted))]">
                <X size={16} />
              </button>
            </div>
            <p className="mt-4 rounded-xl bg-[hsl(var(--accent))]/40 p-4 text-sm leading-6 text-foreground">
              {match.demoData
                ? 'This is demo data, not a real open opportunity \u2014 Aza won\u2019t send you to a placeholder external form. Use this checklist to prepare, and verify the real listing before applying anywhere.'
                : 'Here\u2019s what to prepare before you apply.'}
            </p>
            <div className="mt-5 space-y-2.5">
              {match.requiredDocuments.map((document, index) => (
                <div key={document} className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] p-3 text-sm text-foreground">
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">{index + 1}.</span>
                  {document}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowApplication(false)} className="rounded-full border border-[hsl(var(--border))] px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-[hsl(var(--muted))]">
                Close
              </button>
              <button type="button" onClick={copyBrief} className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-95">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy brief'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
