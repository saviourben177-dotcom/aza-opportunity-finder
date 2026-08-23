import {
  Briefcase,
  Clock,
  GraduationCap,
  Megaphone,
  Shield,
  Sparkles,
  Tag,
  Target,
  Trophy,
  UserPlus,
} from 'lucide-react';
import { Link } from 'wouter';

const stats = [
  { icon: Briefcase, value: '25,000+', label: 'Opportunities and counting' },
  { icon: Target, value: '100+', label: 'Countries covered' },
  { icon: UserPlus, value: '10K+', label: 'Students already growing with Aza' },
  { icon: Trophy, value: '500+', label: 'Success stories and counting' },
];

const steps = [
  { n: 1, title: 'Create your profile', body: 'Tell us about your background and goals' },
  { n: 2, title: 'We analyze thousands of opportunities', body: 'Using our opportunity intelligence engine' },
  { n: 3, title: 'Get matched results', body: 'See only what you\u2019re eligible for' },
  { n: 4, title: 'Apply and win', body: 'Follow the steps and submit your best' },
];

const categories = [
  { icon: GraduationCap, label: 'Scholarships' },
  { icon: Tag, label: 'Grants' },
  { icon: Briefcase, label: 'Internships' },
  { icon: Trophy, label: 'Competitions' },
  { icon: Briefcase, label: 'Jobs' },
  { icon: Megaphone, label: 'Fellowships' },
];

export default function MarketingHome() {
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--border))] bg-white px-3.5 py-1.5 text-xs font-semibold text-foreground">
              <Sparkles size={13} className="text-[hsl(var(--primary))]" />
              Your opportunities. Matched intelligently.
            </span>
            <h1 className="mt-5 text-[2.9rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-foreground sm:text-[3.4rem]">
              Aza finds the right{' '}
              <span className="text-[hsl(var(--primary-accent-text))]">opportunities</span> for
              you.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-muted-foreground">
              We analyze thousands of scholarships, grants, competitions, internships,
              jobs and programs so you don&apos;t have to. Save time. Focus on
              applying. Win more.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/profile"
                data-testid="link-find-opportunities"
                className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-95"
              >
                Find opportunities for me
                <span aria-hidden>&rarr;</span>
              </Link>
              <Link
                href="/opportunities"
                data-testid="link-explore-opportunities"
                className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-white px-6 py-3 text-sm font-bold text-foreground transition hover:bg-[hsl(var(--muted))]"
              >
                Explore opportunities
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-[hsl(var(--muted))]"
                  />
                ))}
              </div>
              <span className="flex h-6 items-center rounded-full bg-[hsl(var(--accent))] px-2.5 text-[11px] font-bold text-[hsl(var(--accent-foreground))]">
                10K+
              </span>
              <p className="text-xs text-muted-foreground">
                Trusted by students in
                <br />
                <span className="font-semibold text-foreground">100+ countries</span>
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-[hsl(var(--accent))]" />
            <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[1.75rem] bg-[hsl(var(--muted))]">
              <p className="max-w-[220px] text-center text-xs font-semibold text-muted-foreground/70">
                Hero photo placeholder &mdash; no licensed image sourced yet
              </p>
            </div>
            <div className="absolute -right-4 top-6 w-48 rounded-2xl border border-[hsl(var(--border))] bg-white p-3.5 shadow-lg">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
                  <Target size={15} />
                </span>
                <div>
                  <p className="text-xs font-bold leading-tight text-foreground">Personalized Matches</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">Opportunities that fit you</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-32 w-48 rounded-2xl border border-[hsl(var(--border))] bg-white p-3.5 shadow-lg">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
                  <Shield size={15} />
                </span>
                <div>
                  <p className="text-xs font-bold leading-tight text-foreground">Eligibility Check</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">Know exactly why you qualify</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-[15.5rem] w-48 rounded-2xl border border-[hsl(var(--border))] bg-white p-3.5 shadow-lg">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
                  <Clock size={15} />
                </span>
                <div>
                  <p className="text-xs font-bold leading-tight text-foreground">Deadline Alerts</p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">Never miss an important deadline</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-6 rounded-[1.5rem] bg-[hsl(var(--sidebar))] px-8 py-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[hsl(var(--primary))]">
                <s.icon size={20} />
              </span>
              <div>
                <p className="text-xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs leading-tight text-white/60">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1.3fr]">
          <div>
            <h2 className="text-xl font-extrabold text-foreground">Start your personalized search</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Tell us about yourself and Aza will find opportunities that are perfect
              for you.
            </p>
            <Link
              href="/profile"
              data-testid="link-create-profile"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:brightness-95"
            >
              <UserPlus size={15} />
              Create your profile
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">Takes less than 2 minutes</p>
          </div>

          <div className="rounded-2xl bg-[hsl(var(--accent))]/40 p-6">
            <h2 className="text-lg font-extrabold text-foreground">How it works</h2>
            <ul className="mt-4 space-y-4">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[11px] font-bold text-[hsl(var(--primary-foreground))]">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{s.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-foreground">Explore opportunities by category</h2>
              <Link href="/opportunities" data-testid="link-view-all-categories" className="text-xs font-bold text-[hsl(var(--primary))]">
                View all
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {categories.map((c) => (
                <Link
                  key={c.label}
                  href="/opportunities"
                  className="flex flex-col items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-2 py-4 text-center transition hover:border-[hsl(var(--primary))]/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-foreground">
                    <c.icon size={16} />
                  </span>
                  <span className="text-[11px] font-semibold text-foreground">{c.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]/30 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[hsl(var(--primary))]">
                  <Sparkles size={14} />
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    AI Match
                    <span className="rounded-full bg-[hsl(var(--primary))] px-1.5 py-0.5 text-[9px] font-bold text-[hsl(var(--primary-foreground))]">Beta</span>
                  </p>
                  <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">AI-powered recommendations from your profile</p>
                </div>
              </div>
              <Link
                href="/ai-match"
                data-testid="link-try-ai-match"
                className="shrink-0 rounded-full bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))]"
              >
                Try AI Match
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[hsl(var(--border))] bg-[hsl(var(--sidebar))] px-6 py-4 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-white/70 sm:flex-row">
          <p className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[hsl(var(--primary))]" />
            Aza helped me find a scholarship I didn&apos;t even know existed.{' '}
            <span className="text-white/50">&mdash; Praise, Nigeria</span>
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span>Real opportunities</span>
            <span>Verified sources</span>
            <span>Updated daily</span>
            <span>100% free to use</span>
          </div>
        </div>
      </section>
    </div>
  );
}
