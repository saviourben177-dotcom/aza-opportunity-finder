import { AlertTriangle, Check, X } from 'lucide-react';
import type { OpportunityMatch } from '@workspace/api-client-react';

function matchLabel(score: number) {
  if (score >= 85) return 'Excellent match';
  if (score >= 65) return 'Good match';
  if (score >= 40) return 'Partial match';
  return 'Weak match';
}

function scoreColor(score: number) {
  if (score >= 65) return 'hsl(var(--primary))';
  if (score >= 40) return 'hsl(32 95% 48%)';
  return 'hsl(var(--destructive))';
}

export default function EligibilityPanel({ match }: { match: OpportunityMatch }) {
  const color = scoreColor(match.score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (match.score / 100) * circumference;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your match score</p>
        <div className="relative mx-auto mt-4 h-32 w-32">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-foreground">
            {Math.round(match.score)}%
          </div>
        </div>
        <p className="mt-3 text-sm font-bold" style={{ color }}>{matchLabel(match.score)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {match.score >= 65
            ? 'This opportunity is highly relevant to your profile.'
            : 'Review the details below before you commit time to this one.'}
        </p>
      </div>

      <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why you are eligible</p>
        <ul className="mt-3 space-y-3">
          {match.eligibleReasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white">
                <Check size={12} strokeWidth={3} />
              </span>
              <span className="text-sm text-foreground">{reason}</span>
            </li>
          ))}
          {match.concernReasons.map((reason, i) => (
            <li key={`c-${i}`} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(32_95%_48%)] text-white">
                <AlertTriangle size={12} strokeWidth={3} />
              </span>
              <span className="text-sm text-foreground">{reason}</span>
            </li>
          ))}
          {match.missingRequirements.map((reason, i) => (
            <li key={`m-${i}`} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--destructive))] text-white">
                <X size={12} strokeWidth={3} />
              </span>
              <span className="text-sm text-foreground">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {match.nextActions.length > 0 && (
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]/30 p-6 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What you should do next</p>
          <ol className="mt-3 space-y-2">
            {match.nextActions.map((action, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-foreground">
                <span className="font-bold text-[hsl(var(--primary))]">{i + 1}.</span>
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
