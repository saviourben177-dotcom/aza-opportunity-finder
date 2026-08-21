import { ArrowLeft, ArrowUpRight, CalendarClock, ChevronRight, Filter, RefreshCw, Search, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import type { AnalysisResult, OpportunityMatch } from '@workspace/api-client-react';

const labels = { eligible: 'Good to go', potential: 'Worth a closer look', ineligible: 'Not this time' } as const;
const groupCopy = { eligible: 'You meet the core requirements. Read the brief, then make your move.', potential: 'One or two details need checking before you commit your time.', ineligible: 'Clear reasons, so you can rule these out with confidence.' } as const;

function StatusMark({ kind }: { kind: OpportunityMatch['eligibility'] }) {
  if (kind === 'eligible') return <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><ShieldCheck size={17} /></span>;
  if (kind === 'potential') return <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Search size={17} /></span>;
  return <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-muted-foreground"><TriangleAlert size={17} /></span>;
}

function OpportunityCard({ item, index }: { item: OpportunityMatch; index: number }) {
  const deadline = item.daysRemaining < 0 ? 'Closed' : item.daysRemaining === 0 ? 'Closes today' : `${item.daysRemaining} days left`;
  return (
    <Link href={`/opportunities/${item.id}`} data-testid={`link-opportunity-${item.id}`} className={`group block animate-rise rounded-2xl border bg-[hsl(var(--card))] p-5 transition hover:-translate-y-1 hover:border-[hsl(var(--primary))]/40 hover:shadow-[0_14px_32px_rgba(23,51,43,.08)] delay-${Math.min(index + 1, 4)}`}>
      <div className="flex items-start justify-between gap-4"><StatusMark kind={item.eligibility} /><span className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{item.category}</span></div>
      <h3 data-testid={`text-opportunity-title-${item.id}`} className="mt-6 max-w-md font-display text-2xl leading-[1.05] tracking-[-.02em]">{item.title}</h3>
      <p className="mt-2 text-sm font-semibold text-[hsl(var(--primary))]">{item.organization}</p>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><CalendarClock size={13} /> {deadline}</span><span className="h-1 w-1 rounded-full bg-border" /><span>Fit score {Math.round(item.score)}</span><ArrowUpRight size={15} className="ml-auto transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

export default function Results() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [filter, setFilter] = useState<'all' | OpportunityMatch['eligibility']>('all');
  useEffect(() => {
    const saved = sessionStorage.getItem('aza-analysis');
    if (saved) {
      try { setResult(JSON.parse(saved) as AnalysisResult); } catch { setResult(null); }
    }
  }, []);
  const visible = useMemo(() => result?.matches.filter((item) => filter === 'all' || item.eligibility === filter) ?? [], [filter, result]);

  if (!result) {
    return <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-5 text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--accent))]"><RefreshCw size={25} className="text-[hsl(var(--primary))]" /></div><h1 className="mt-7 font-display text-4xl">Your brief is waiting.</h1><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Start with a few details and Aza will check the current opportunity set against your real constraints.</p><Link href="/#profile" data-testid="link-start-brief" className="mt-7 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]">Start a brief</Link></main>;
  }

  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-10 lg:pt-16">
      <div className="flex flex-wrap items-center justify-between gap-4"><Link href="/" data-testid="link-back-home" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"><ArrowLeft size={16} /> Edit brief</Link><span className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Personal analysis / ready</span></div>
      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
        <div className="animate-rise"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Your opportunity brief</p><h1 className="mt-3 max-w-3xl font-display text-[clamp(3rem,7vw,6.5rem)] leading-[.88] tracking-[-.055em]">Here’s what <em className="text-[hsl(var(--primary))]">holds up.</em></h1><p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground">Aza checked {result.total} opportunities against your location, stage, skills, travel reality, and budget.</p></div>
        <div className="grid grid-cols-3 gap-2 border-y py-4 text-center lg:mb-1 lg:border-y-0 lg:border-l lg:pl-6"><div><p data-testid="stat-eligible-count" className="font-display text-4xl text-[hsl(var(--primary))]">{result.eligibleCount}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-muted-foreground">Good to go</p></div><div><p data-testid="stat-potential-count" className="font-display text-4xl">{result.potentialCount}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-muted-foreground">Potential</p></div><div><p data-testid="stat-ineligible-count" className="font-display text-4xl text-muted-foreground">{result.ineligibleCount}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-muted-foreground">Not this time</p></div></div>
      </section>
      <div className="mt-14 flex flex-wrap items-center gap-2 border-b pb-4"><span className="mr-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.13em] text-muted-foreground"><Filter size={14} /> Show</span>{(['all', 'eligible', 'potential', 'ineligible'] as const).map((item) => <button key={item} data-testid={`button-filter-${item}`} onClick={() => setFilter(item)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${filter === item ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border text-muted-foreground hover:bg-[hsl(var(--muted))]'}`}>{item === 'all' ? 'Everything' : labels[item]}</button>)}</div>
      {filter === 'all' ? <div className="mt-12 space-y-14">{(['eligible', 'potential', 'ineligible'] as const).map((kind) => {
        const group = result.matches.filter((item) => item.eligibility === kind);
        if (!group.length) return null;
        return <section key={kind}><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="flex items-center gap-3 font-display text-3xl">{labels[kind]} <span className="font-mono text-sm text-muted-foreground">/{group.length}</span></h2><p className="mt-1 text-sm text-muted-foreground">{groupCopy[kind]}</p></div>{kind === 'eligible' && <span className="flex items-center gap-2 text-xs text-[hsl(var(--primary))]"><Sparkles size={14} /> Start here</span>}</div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{group.map((item, index) => <OpportunityCard key={item.id} item={item} index={index} />)}</div></section>;
      })}</div> : <div className="mt-12">{visible.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map((item, index) => <OpportunityCard key={item.id} item={item} index={index} />)}</div> : <div className="rounded-2xl border border-dashed p-12 text-center"><p className="font-display text-2xl">Nothing in this group.</p><p className="mt-2 text-sm text-muted-foreground">That is useful information too. Try another view.</p></div>}</div>}
    </main>
  );
}