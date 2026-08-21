import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Check, Compass, Globe2, MapPin, Sparkles, WalletCards } from 'lucide-react';
import { type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useAnalyzeOpportunities } from '@workspace/api-client-react';
import type { ProfileInput } from '@workspace/api-client-react';
import { Form } from '@/components/ui/form';

const profileSchema = z.object({
  age: z.coerce.number().min(13, 'Must be at least 13').max(100, 'Please enter a valid age'),
  country: z.string().min(2, 'Add your country'),
  region: z.string().min(2, 'Add your region or city'),
  status: z.enum(['student', 'professional', 'graduate', 'founder', 'unemployed']),
  education: z.enum(['secondary', 'undergraduate', 'graduate', 'postgraduate']),
  interests: z.string().min(2, 'Add at least one interest'),
  skills: z.string(),
  goals: z.string().min(8, 'Tell us a little about what you want next'),
  budget: z.coerce.number().min(0),
  internationalTravel: z.boolean(),
  localTravel: z.boolean(),
  preferredTypes: z.string().min(2, 'Add at least one opportunity type'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const defaults: ProfileForm = {
  age: 24,
  country: '',
  region: '',
  status: 'professional',
  education: 'undergraduate',
  interests: 'climate, civic technology',
  skills: 'research, writing',
  goals: 'Find a funded opportunity where I can build useful work with ambitious people.',
  budget: 0,
  internationalTravel: false,
  localTravel: true,
  preferredTypes: 'fellowship, grant, residency',
};

const demoDefaults: ProfileForm = {
  age: 16,
  country: 'Nigeria',
  region: 'Lagos',
  status: 'student',
  education: 'secondary',
  interests: 'software engineering, technology',
  skills: 'JavaScript, building products',
  goals: 'Find a free online opportunity where I can build useful software and meet other young builders.',
  budget: 0,
  internationalTravel: false,
  localTravel: false,
  preferredTypes: 'hackathon, scholarship, competition',
};

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-baseline justify-between gap-3 text-[11px] font-bold uppercase tracking-[.16em] text-[hsl(var(--foreground))]">
        {label}
        {hint && <span className="font-mono text-[10px] font-normal normal-case tracking-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}

const inputClass = 'w-full rounded-xl border bg-[hsl(var(--card))] px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--accent))]/40';

export default function Home() {
  const [, setLocation] = useLocation();
  const analyze = useAnalyzeOpportunities();
  const form = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: defaults });
  const useDemoProfile = () => {
    form.reset(demoDefaults);
    document.getElementById('profile')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submit = (values: ProfileForm) => {
    const profile: ProfileInput = {
      ...values,
      interests: values.interests.split(',').map((item) => item.trim()).filter(Boolean),
      skills: values.skills.split(',').map((item) => item.trim()).filter(Boolean),
      preferredTypes: values.preferredTypes.split(',').map((item) => item.trim()).filter(Boolean),
    };
    analyze.mutate({ data: profile }, {
      onSuccess: (result) => {
        sessionStorage.setItem('aza-analysis', JSON.stringify(result));
        sessionStorage.setItem('aza-profile', JSON.stringify(profile));
        setLocation('/results');
      },
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-10 lg:px-10">
      <section className="grid items-end gap-12 pb-16 pt-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-24 lg:pb-24 lg:pt-16">
        <div className="animate-rise">
          <div className="mb-7 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.2em] text-[hsl(var(--primary))]">
            <span className="h-px w-9 bg-[hsl(var(--accent))]" /> Opportunity intelligence, without the noise
          </div>
          <h1 className="max-w-3xl font-display text-[clamp(3.3rem,8vw,7.5rem)] leading-[.88] tracking-[-.055em] text-[hsl(var(--foreground))]">
            Find what’s <em className="text-[hsl(var(--primary))]">actually</em> for you.
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground lg:text-lg">
            Aza reads the fine print before you do. Tell us where you are, what you can do, and where you want to go — we’ll surface the opportunities worth your time.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-3 gap-5 border-t pt-5">
            <div><p className="font-display text-2xl">01</p><p className="mt-1 text-xs leading-4 text-muted-foreground">Set your context</p></div>
            <div><p className="font-display text-2xl">02</p><p className="mt-1 text-xs leading-4 text-muted-foreground">Aza checks the rules</p></div>
            <div><p className="font-display text-2xl">03</p><p className="mt-1 text-xs leading-4 text-muted-foreground">Make your next move</p></div>
          </div>
          <button type="button" data-testid="button-try-demo-profile" onClick={useDemoProfile} className="mt-8 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/25 px-4 py-2.5 text-xs font-bold text-[hsl(var(--primary))] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--accent))]/25">
            Try the Nigerian student example <ArrowRight size={14} />
          </button>
        </div>
        <div className="animate-rise delay-2 relative rounded-[2rem] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-[12px_18px_0_hsl(var(--accent))] sm:p-9">
          <div className="absolute right-8 top-7 h-16 w-16 rounded-full border border-[hsl(var(--accent))]/50" />
          <div className="absolute right-12 top-11 h-8 w-8 rounded-full bg-[hsl(var(--accent))]" />
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary-foreground))]/60">Aza / personal brief</p>
          <h2 className="mt-16 max-w-sm font-display text-4xl leading-[.98] tracking-[-.035em] sm:text-5xl">The right detail changes the search.</h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[hsl(var(--primary-foreground))]/70">Your profile stays in this browser. No account, no broad blast of “relevant” links.</p>
          <div className="mt-10 flex flex-wrap gap-2">
            {['Eligibility first', 'Deadline aware', 'Plain reasons'].map((item) => <span key={item} className="rounded-full border border-[hsl(var(--primary-foreground))]/20 px-3 py-1.5 text-[11px]">{item}</span>)}
          </div>
        </div>
      </section>

      <section id="profile" className="scroll-mt-8 border-t pt-10 lg:pt-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--primary))]">Your starting point</p><h2 className="mt-2 font-display text-4xl tracking-[-.035em]">Build a useful brief.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Aza checks location, age, education, status, skills, cost, travel, and deadline before it recommends anything.</p></div>
          <p className="max-w-xs text-right text-sm leading-5 text-muted-foreground">Takes about 60 seconds. You can edit it and run Aza again whenever your direction changes.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="rounded-[1.5rem] border bg-[hsl(var(--card))] p-5 shadow-[0_18px_60px_rgba(23,51,43,.06)] sm:p-8 lg:p-10">
            <div className="grid gap-x-8 gap-y-7 lg:grid-cols-12">
              <div className="lg:col-span-5"><Field label="Where are you based?" error={form.formState.errors.country?.message}><input data-testid="input-country" className={inputClass} placeholder="Country" {...form.register('country')} /></Field></div>
              <div className="lg:col-span-4"><Field label="Region / city" error={form.formState.errors.region?.message}><input data-testid="input-region" className={inputClass} placeholder="e.g. Accra, Ontario, Catalonia" {...form.register('region')} /></Field></div>
              <div className="lg:col-span-3"><Field label="Age" error={form.formState.errors.age?.message}><input data-testid="input-age" type="number" className={inputClass} {...form.register('age')} /></Field></div>
              <div className="lg:col-span-4"><Field label="Current status"><select data-testid="select-status" className={inputClass} {...form.register('status')}><option value="student">Student</option><option value="professional">Professional</option><option value="graduate">Recent graduate</option><option value="founder">Founder</option><option value="unemployed">Between roles</option></select></Field></div>
              <div className="lg:col-span-4"><Field label="Education"><select data-testid="select-education" className={inputClass} {...form.register('education')}><option value="secondary">Secondary</option><option value="undergraduate">Undergraduate</option><option value="graduate">Graduate</option><option value="postgraduate">Postgraduate</option></select></Field></div>
              <div className="lg:col-span-4"><Field label="Working budget" hint="USD / application"><div className="relative"><span className="absolute left-4 top-3 text-sm text-muted-foreground">$</span><input data-testid="input-budget" type="number" min="0" className={`${inputClass} pl-8`} {...form.register('budget')} /></div></Field></div>
              <div className="lg:col-span-6"><Field label="Interests" hint="comma separated" error={form.formState.errors.interests?.message}><input data-testid="input-interests" className={inputClass} placeholder="climate, public health, design" {...form.register('interests')} /></Field></div>
              <div className="lg:col-span-6"><Field label="Skills you can bring" hint="comma separated"><input data-testid="input-skills" className={inputClass} placeholder="research, facilitation, Python" {...form.register('skills')} /></Field></div>
              <div className="lg:col-span-7"><Field label="What are you hoping to do?" error={form.formState.errors.goals?.message}><textarea data-testid="input-goals" rows={4} className={`${inputClass} resize-none`} placeholder="A short sentence is enough." {...form.register('goals')} /></Field></div>
              <div className="space-y-5 lg:col-span-5">
                <Field label="Opportunity types" hint="comma separated" error={form.formState.errors.preferredTypes?.message}><input data-testid="input-preferred-types" className={inputClass} placeholder="fellowship, grant, job" {...form.register('preferredTypes')} /></Field>
                <div>
                  <span className="mb-3 block text-[11px] font-bold uppercase tracking-[.16em]">Travel reality</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition hover:bg-[hsl(var(--muted))]"><input data-testid="checkbox-local-travel" type="checkbox" className="accent-[hsl(var(--primary))]" {...form.register('localTravel')} /><MapPin size={15} /> I can travel locally</label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition hover:bg-[hsl(var(--muted))]"><input data-testid="checkbox-international-travel" type="checkbox" className="accent-[hsl(var(--primary))]" {...form.register('internationalTravel')} /><Globe2 size={15} /> I can travel abroad</label>
                  </div>
                </div>
              </div>
            </div>
            {analyze.isError && <div data-testid="status-analysis-error" className="mt-8 flex items-start gap-3 rounded-xl border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 p-4 text-sm text-[hsl(var(--destructive))]"><Compass size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Aza couldn’t complete the check.</p><p className="mt-1 opacity-80">Please review your details and try again.</p></div></div>}
            <div className="mt-9 flex flex-col items-start justify-between gap-4 border-t pt-7 sm:flex-row sm:items-center">
              <p className="flex items-center gap-2 text-xs text-muted-foreground"><Sparkles size={14} className="text-[hsl(var(--primary))]" /> No account needed for this demo</p>
              <button data-testid="button-analyze" type="submit" disabled={analyze.isPending} className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[hsl(var(--primary))] px-6 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-wait disabled:opacity-70 sm:w-auto">
                {analyze.isPending ? 'Reading the fine print…' : 'Run my opportunity brief'} <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </Form>
      </section>
      <section className="grid gap-5 border-t py-16 sm:grid-cols-3 lg:py-24">
        <div className="rounded-2xl bg-[hsl(var(--accent))]/25 p-6"><WalletCards className="text-[hsl(var(--primary))]" size={21} /><h3 className="mt-10 font-display text-2xl">No vague “matches”</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Every result comes with the rule that made it land here.</p></div>
        <div className="rounded-2xl border p-6"><Check className="text-[hsl(var(--primary))]" size={21} /><h3 className="mt-10 font-display text-2xl">Good enough to act</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">See documents, timing, cost, and your next step without opening ten tabs.</p></div>
        <div className="rounded-2xl bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]"><Compass size={21} /><h3 className="mt-10 font-display text-2xl">Built for the maybe</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--primary-foreground))]/70">Potential matches are not hidden. They’re explained, so you can close the gap.</p></div>
      </section>
    </main>
  );
}