import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, Globe2, MapPin, Plus, X } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'wouter';
import { z } from 'zod';
import { useAnalyzeOpportunities } from '@workspace/api-client-react';
import type { ProfileInput } from '@workspace/api-client-react';
import { Form } from '@/components/ui/form';

function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const commit = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2.5 focus-within:border-[hsl(var(--primary))] focus-within:ring-2 focus-within:ring-[hsl(var(--accent))]">
      {values.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1.5 rounded-full border border-[hsl(var(--primary))]/30 bg-[hsl(var(--accent))]/50 px-2.5 py-1 text-xs font-semibold text-[hsl(var(--accent-foreground))]"
        >
          {tag}
          <button type="button" onClick={() => onChange(values.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
            <X size={11} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Backspace' && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={values.length ? '' : placeholder}
        className="min-w-[120px] flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
      />
      {draft && (
        <button
          type="button"
          onClick={commit}
          className="flex items-center gap-1 rounded-full border border-[hsl(var(--border))] px-2 py-1 text-[11px] font-semibold text-muted-foreground"
        >
          <Plus size={11} /> Add
        </button>
      )}
    </div>
  );
}

const profileSchema = z.object({
  age: z.coerce.number().min(13, 'Must be at least 13').max(100, 'Please enter a valid age'),
  country: z.string().min(2, 'Add your country'),
  region: z.string().min(2, 'Add your region or city'),
  status: z.enum(['student', 'professional', 'graduate', 'founder', 'unemployed']),
  education: z.enum(['secondary', 'undergraduate', 'graduate', 'postgraduate']),
  interests: z.array(z.string()).min(1, 'Add at least one interest'),
  skills: z.array(z.string()),
  goals: z.string().min(8, 'Tell us a little about what you want next'),
  budget: z.coerce.number().min(0),
  internationalTravel: z.boolean(),
  localTravel: z.boolean(),
  preferredTypes: z.array(z.string()).min(1, 'Add at least one opportunity type'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const defaults: ProfileForm = {
  age: 24,
  country: '',
  region: '',
  status: 'professional',
  education: 'undergraduate',
  interests: [],
  skills: [],
  goals: '',
  budget: 0,
  internationalTravel: false,
  localTravel: true,
  preferredTypes: [],
};

const demoDefaults: ProfileForm = {
  age: 16,
  country: 'Nigeria',
  region: 'Lagos',
  status: 'student',
  education: 'secondary',
  interests: ['Software Development', 'AI / Machine Learning'],
  skills: ['JavaScript', 'building products'],
  goals: 'Find a free online opportunity where I can build useful software and meet other young builders.',
  budget: 0,
  internationalTravel: false,
  localTravel: false,
  preferredTypes: ['Hackathon', 'Scholarship', 'Competition'],
};

const steps = ['About You', 'Goals & Interests', 'Preferences', 'Review'] as const;

const inputClass =
  'w-full rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--accent))]';

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-3 text-xs font-bold text-foreground">
        {label}
        {hint && <span className="text-[10px] font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-[hsl(var(--destructive))]">{error}</span>}
    </label>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                i < current
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : i === current
                  ? 'border-2 border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                  : 'border border-[hsl(var(--border))] text-muted-foreground'
              }`}
            >
              {i < current ? <Check size={13} /> : i + 1}
            </span>
            <span className={`hidden text-xs font-semibold sm:inline ${i === current ? 'text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && <span className="h-px w-6 bg-[hsl(var(--border))] sm:w-10" />}
        </div>
      ))}
    </div>
  );
}

export default function ProfileWizard() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const analyze = useAnalyzeOpportunities();
  const form = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: defaults, mode: 'onChange' });

  const useDemoProfile = () => form.reset(demoDefaults);

  const stepFields: Record<number, (keyof ProfileForm)[]> = {
    0: ['age', 'country', 'region', 'status', 'education'],
    1: ['interests', 'skills', 'goals'],
    2: ['budget', 'preferredTypes', 'localTravel', 'internationalTravel'],
    3: [],
  };

  const next = async () => {
    const valid = await form.trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = (values: ProfileForm) => {
    const profile: ProfileInput = { ...values };
    analyze.mutate(
      { data: profile },
      {
        onSuccess: (result) => {
          sessionStorage.setItem('aza-analysis', JSON.stringify(result));
          sessionStorage.setItem('aza-profile', JSON.stringify(profile));
          setLocation('/dashboard');
        },
      }
    );
  };

  const values = form.watch();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link href="/" data-testid="link-wizard-back-home" className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
        <ArrowLeft size={15} /> Back
      </Link>
      <div className="mt-6">
        <Stepper current={step} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="mt-8">
          {step === 0 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-7">
              <h1 className="text-xl font-extrabold text-foreground">Tell us about yourself</h1>
              <p className="mt-1 text-sm text-muted-foreground">This helps Aza find the right opportunities for you.</p>

              <div className="mt-6 space-y-5">
                <div>
                  <span className="text-xs font-bold text-foreground">I am</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(['student', 'professional'] as const).map((v) => (
                      <label
                        key={v}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                          values.status === v
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--accent))]/40 text-[hsl(var(--primary))]'
                            : 'border-[hsl(var(--border))] text-muted-foreground'
                        }`}
                      >
                        <input type="radio" value={v} className="hidden" {...form.register('status')} />
                        {v}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Date of birth" hint="or age below">
                    <input
                      data-testid="input-age"
                      type="number"
                      min={13}
                      max={100}
                      className={inputClass}
                      {...form.register('age')}
                    />
                  </Field>
                  <Field label="Current education level">
                    <select data-testid="select-education" className={inputClass} {...form.register('education')}>
                      <option value="secondary">Senior Secondary / High School</option>
                      <option value="undergraduate">Undergraduate</option>
                      <option value="graduate">Graduate</option>
                      <option value="postgraduate">Postgraduate</option>
                    </select>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Country" error={form.formState.errors.country?.message}>
                    <input data-testid="input-country" className={inputClass} placeholder="e.g. Nigeria" {...form.register('country')} />
                  </Field>
                  <Field label="Region / city" error={form.formState.errors.region?.message}>
                    <input data-testid="input-region" className={inputClass} placeholder="e.g. Lagos" {...form.register('region')} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-7">
              <h1 className="text-xl font-extrabold text-foreground">Goals &amp; interests</h1>
              <p className="mt-1 text-sm text-muted-foreground">What are you working toward?</p>

              <div className="mt-6 space-y-5">
                <Field label="What are you interested in?" error={form.formState.errors.interests?.message}>
                  <TagInput
                    values={values.interests}
                    onChange={(next) => form.setValue('interests', next, { shouldValidate: true })}
                    placeholder="Type and press Enter"
                  />
                </Field>
                <Field label="Skills you can bring">
                  <TagInput
                    values={values.skills}
                    onChange={(next) => form.setValue('skills', next, { shouldValidate: true })}
                    placeholder="Type and press Enter"
                  />
                </Field>
                <Field label="What are you hoping to do?" error={form.formState.errors.goals?.message}>
                  <textarea
                    data-testid="input-goals"
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder="A short sentence is enough."
                    {...form.register('goals')}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-7">
              <h1 className="text-xl font-extrabold text-foreground">Preferences</h1>
              <p className="mt-1 text-sm text-muted-foreground">Budget, opportunity types, and travel.</p>

              <div className="mt-6 space-y-5">
                <Field label="Working budget" hint="USD / application">
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-sm text-muted-foreground">$</span>
                    <input data-testid="input-budget" type="number" min={0} className={`${inputClass} pl-8`} {...form.register('budget')} />
                  </div>
                </Field>
                <Field label="Opportunity types" error={form.formState.errors.preferredTypes?.message}>
                  <TagInput
                    values={values.preferredTypes}
                    onChange={(next) => form.setValue('preferredTypes', next, { shouldValidate: true })}
                    placeholder="hackathon, scholarship, competition"
                  />
                </Field>
                <div>
                  <span className="text-xs font-bold text-foreground">Travel</span>
                  <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm transition hover:bg-[hsl(var(--muted))]">
                      <input data-testid="checkbox-local-travel" type="checkbox" className="accent-[hsl(var(--primary))]" {...form.register('localTravel')} />
                      <MapPin size={15} /> I can travel locally
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm transition hover:bg-[hsl(var(--muted))]">
                      <input data-testid="checkbox-international-travel" type="checkbox" className="accent-[hsl(var(--primary))]" {...form.register('internationalTravel')} />
                      <Globe2 size={15} /> I can travel abroad
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-7">
              <h1 className="text-xl font-extrabold text-foreground">Review</h1>
              <p className="mt-1 text-sm text-muted-foreground">Check your details before Aza runs the match.</p>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between border-b border-[hsl(var(--border))] pb-2">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="font-semibold capitalize text-foreground">{values.status}</dd>
                </div>
                <div className="flex justify-between border-b border-[hsl(var(--border))] pb-2">
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="font-semibold text-foreground">{values.region || '\u2014'}, {values.country || '\u2014'}</dd>
                </div>
                <div className="flex justify-between border-b border-[hsl(var(--border))] pb-2">
                  <dt className="text-muted-foreground">Age</dt>
                  <dd className="font-semibold text-foreground">{values.age}</dd>
                </div>
                <div className="flex justify-between border-b border-[hsl(var(--border))] pb-2">
                  <dt className="text-muted-foreground">Education</dt>
                  <dd className="font-semibold capitalize text-foreground">{values.education}</dd>
                </div>
                <div className="flex justify-between border-b border-[hsl(var(--border))] pb-2">
                  <dt className="text-muted-foreground">Interests</dt>
                  <dd className="max-w-[60%] text-right font-semibold text-foreground">{values.interests.length ? values.interests.join(', ') : '\u2014'}</dd>
                </div>
                <div className="flex justify-between pb-2">
                  <dt className="text-muted-foreground">Opportunity types</dt>
                  <dd className="max-w-[60%] text-right font-semibold text-foreground">{values.preferredTypes.length ? values.preferredTypes.join(', ') : '\u2014'}</dd>
                </div>
              </dl>

              {analyze.isError && (
                <div data-testid="status-analysis-error" className="mt-5 rounded-xl border border-[hsl(var(--destructive))]/30 bg-[hsl(4_78%_97%)] p-4 text-sm text-[hsl(var(--destructive))]">
                  Aza couldn&apos;t complete the check. Please review your details and try again.
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            {step === 0 ? (
              <button
                type="button"
                data-testid="button-try-demo-profile"
                onClick={useDemoProfile}
                className="text-xs font-bold text-[hsl(var(--primary))]"
              >
                Try a demo profile
              </button>
            ) : (
              <button
                type="button"
                data-testid="button-wizard-back"
                onClick={back}
                className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-[hsl(var(--muted))]"
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                type="button"
                data-testid="button-wizard-next"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-sm font-bold text-white transition hover:brightness-95"
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="submit"
                data-testid="button-analyze"
                disabled={analyze.isPending}
                className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-sm font-bold text-white transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70"
              >
                {analyze.isPending ? 'Analyzing\u2026' : 'Find my matches'} <ArrowRight size={15} />
              </button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
