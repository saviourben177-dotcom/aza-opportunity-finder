import { ArrowLeft, ArrowUpRight, CalendarDays, Check, CircleAlert, ClipboardList, Copy, FileText, Globe2, MapPin, RefreshCw, ShieldCheck, WalletCards, X } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { useEffect, useState } from 'react';
import { useGetOpportunity, getGetOpportunityQueryKey } from '@workspace/api-client-react';
import type { OpportunityMatch } from '@workspace/api-client-react';

function DetailSkeleton() {
  return <main className="mx-auto max-w-6xl px-5 py-16"><div className="animate-pulse-soft space-y-5"><div className="h-3 w-28 rounded bg-muted" /><div className="h-16 max-w-2xl rounded bg-muted" /><div className="h-5 w-64 rounded bg-muted" /><div className="mt-12 h-56 rounded-2xl bg-muted" /></div></main>;
}

export default function OpportunityDetail() {
  const { id = '' } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetOpportunity(id, { query: { enabled: Boolean(id), queryKey: getGetOpportunityQueryKey(id) } });
  const [showApplication, setShowApplication] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedMatch, setSavedMatch] = useState<OpportunityMatch | null>(null);
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
  if (isError && !displayMatch || !displayMatch) return <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--accent))]"><CircleAlert size={23} className="text-[hsl(var(--primary))]" /></div><h1 className="mt-6 font-display text-4xl">That opportunity is out of reach.</h1><p className="mt-3 text-sm text-muted-foreground">We couldn’t load the reasoning for this listing. It may have moved or the connection may have blinked.</p><button data-testid="button-retry-opportunity" onClick={() => refetch()} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]"><RefreshCw size={15} /> Try again</button></main>;

  const match = displayMatch;
  const isEligible = match.eligibility === 'eligible';
  const isPotential = match.eligibility === 'potential';
  const deadlineText = match.daysRemaining < 0 ? 'Application closed' : match.daysRemaining === 0 ? 'Closes today' : `${match.daysRemaining} days remaining`;
  const applicationBrief = `Aza application brief: ${match.title}\n\nDocuments to prepare:\n${match.requiredDocuments.map((document) => `- ${document}`).join('\n')}\n\nDeadline: ${match.deadline}`;
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
    <>
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
      <Link href="/results" data-testid="link-back-results" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"><ArrowLeft size={16} /> Back to your brief</Link>
      <section className="mt-12 grid gap-10 lg:grid-cols-[1fr_310px]">
        <div className="animate-rise">
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground"><span className={`rounded-full px-3 py-1.5 ${isEligible ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : isPotential ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]' : 'bg-muted'}`}>{isEligible ? 'Good to go' : isPotential ? 'Worth a closer look' : 'Not this time'}</span><span>{match.category}</span></div>
          <h1 data-testid="text-detail-title" className="mt-6 max-w-4xl font-display text-[clamp(3rem,7vw,6.4rem)] leading-[.88] tracking-[-.055em]">{match.title}</h1>
          <p className="mt-5 text-lg font-semibold text-[hsl(var(--primary))]">{match.organization}</p>
          <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground">{match.description}</p>
          <div className="mt-8 flex flex-wrap gap-2">{match.tags.map((tag) => <span key={tag} className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground">#{tag}</span>)}</div>
        </div>
        <aside className="h-fit rounded-2xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-[10px_12px_0_hsl(var(--accent))] lg:mt-10">
          <div className="flex items-center justify-between border-b border-[hsl(var(--primary-foreground))]/20 pb-4"><span className="font-mono text-[10px] uppercase tracking-[.15em] text-[hsl(var(--primary-foreground))]/60">Decision brief</span><span className="font-display text-3xl">{Math.round(match.score)}<small className="font-sans text-sm">/100</small></span></div>
          <div className="space-y-4 py-5 text-sm"><div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-[hsl(var(--primary-foreground))]/65"><CalendarDays size={15} /> Timing</span><strong>{deadlineText}</strong></div><div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-[hsl(var(--primary-foreground))]/65"><WalletCards size={15} /> Cost</span><strong>{match.applicationCost ? `$${match.applicationCost}` : 'Free to apply'}</strong></div><div className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-[hsl(var(--primary-foreground))]/65"><Globe2 size={15} /> Format</span><strong>{match.onlineAvailability ? 'Online option' : 'In person'}</strong></div></div>
          <button data-testid="button-apply-opportunity" onClick={apply} disabled={match.daysRemaining < 0} className="group flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--accent))] px-4 py-3 text-sm font-bold text-[hsl(var(--accent-foreground))] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">Build my application brief <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5" /></button>
          <p className="mt-3 text-center text-[10px] text-[hsl(var(--primary-foreground))]/45">Demo data · prepare before you apply</p>
        </aside>
      </section>
      <section className="mt-20 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-2xl border bg-[hsl(var(--card))] p-6 sm:p-8"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))]"><ShieldCheck size={17} /></span><h2 className="font-display text-3xl">Why Aza put this here</h2></div><div className="mt-7 space-y-4">{match.eligibleReasons.map((reason, index) => <div data-testid={`reason-positive-${index}`} key={reason} className="flex gap-3 text-sm leading-6"><Check size={17} className="mt-1 shrink-0 text-[hsl(var(--primary))]" /><span>{reason}</span></div>)}{match.concernReasons.map((reason, index) => <div data-testid={`reason-concern-${index}`} key={reason} className="flex gap-3 text-sm leading-6 text-muted-foreground"><CircleAlert size={17} className="mt-1 shrink-0 text-[hsl(var(--destructive))]" /><span>{reason}</span></div>)}</div></div>
        <div className="rounded-2xl bg-[hsl(var(--muted))] p-6 sm:p-8"><h2 className="font-display text-3xl">Your next moves</h2><div className="mt-7 space-y-5">{match.nextActions.map((action, index) => <div key={action} className="flex gap-3 text-sm leading-6"><span className="font-mono text-xs text-[hsl(var(--primary))]">0{index + 1}</span><span>{action}</span></div>)}</div></div>
      </section>
      {match.missingRequirements.length > 0 && <section className="mt-5 rounded-2xl border border-[hsl(var(--destructive))]/25 bg-[hsl(var(--destructive))]/5 p-6 sm:p-8"><div className="flex gap-3"><CircleAlert className="mt-0.5 shrink-0 text-[hsl(var(--destructive))]" size={19} /><div><h2 className="font-display text-2xl">What is still missing</h2><ul className="mt-4 grid gap-3 text-sm leading-6 sm:grid-cols-2">{match.missingRequirements.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--destructive))]" />{item}</li>)}</ul></div></div></section>}
      <section className="mt-5 grid gap-5 border-t pt-8 sm:grid-cols-3"><div className="flex gap-3"><MapPin size={17} className="mt-1 text-[hsl(var(--primary))]" /><div><p className="text-xs font-bold uppercase tracking-[.12em]">Eligibility</p><p className="mt-1 text-sm text-muted-foreground">{match.eligibleCountries.join(', ')}</p></div></div><div className="flex gap-3"><FileText size={17} className="mt-1 text-[hsl(var(--primary))]" /><div><p className="text-xs font-bold uppercase tracking-[.12em]">Documents</p><p className="mt-1 text-sm text-muted-foreground">{match.requiredDocuments.join(', ')}</p></div></div><div className="flex gap-3"><ClipboardList size={17} className="mt-1 text-[hsl(var(--primary))]" /><div><p className="text-xs font-bold uppercase tracking-[.12em]">Source check</p><p className="mt-1 text-sm text-muted-foreground">{match.source} · verified {new Date(match.verificationDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p></div></div></section>
      </main>
      {showApplication && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--foreground))]/35 p-3 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="application-brief-title">
          <div className="w-full max-w-lg rounded-[1.5rem] bg-[hsl(var(--card))] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Aza action plan</p>
                <h2 id="application-brief-title" className="mt-2 font-display text-3xl tracking-[-.03em]">Make this one real.</h2>
              </div>
              <button type="button" aria-label="Close application brief" onClick={() => setShowApplication(false)} className="rounded-full border p-2 text-muted-foreground transition hover:bg-muted"><X size={17} /></button>
            </div>
            <p className="mt-4 rounded-xl bg-[hsl(var(--accent))]/25 p-4 text-sm leading-6 text-foreground">This is a demo opportunity, so Aza won’t send you to a pretend external form. Use this brief to prepare the real application when you verify the opportunity source.</p>
            <div className="mt-6 space-y-3">
              {match.requiredDocuments.map((document, index) => <div key={document} className="flex items-start gap-3 rounded-xl border p-3 text-sm"><span className="font-mono text-xs text-[hsl(var(--primary))]">0{index + 1}</span><span>{document}</span></div>)}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowApplication(false)} className="rounded-full border px-5 py-3 text-sm font-bold transition hover:bg-muted">Close</button>
              <button type="button" onClick={copyBrief} className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5">{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Brief copied' : 'Copy application brief'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}