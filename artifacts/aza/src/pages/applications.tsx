import { Construction, ListChecks } from 'lucide-react';
import DashboardShell from '@/components/dashboard-shell';

export default function Applications() {
  return (
    <DashboardShell>
      <h1 className="text-2xl font-extrabold text-foreground">Applications</h1>
      <p className="mt-1 text-sm text-muted-foreground">Track the opportunities you&apos;ve applied to.</p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[hsl(32_95%_48%)]/30 bg-[hsl(32_95%_97%)] p-4">
        <Construction size={18} className="mt-0.5 shrink-0 text-[hsl(32_95%_45%)]" />
        <div>
          <p className="text-sm font-bold text-foreground">Not built yet</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            This is layout only. There is no application-tracking logic behind it, and the
            &ldquo;Apply&rdquo; flow on opportunity pages doesn&apos;t submit anything real yet either &mdash;
            it links out to placeholder URLs. Application status tracking needs real apply-flow
            integration and persistence, neither of which exist right now.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white p-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-muted-foreground">
          <ListChecks size={20} />
        </span>
        <p className="mt-4 text-sm font-semibold text-foreground">No applications tracked</p>
        <p className="mt-1 text-xs text-muted-foreground">This feature doesn&apos;t exist yet.</p>
      </div>
    </DashboardShell>
  );
}
