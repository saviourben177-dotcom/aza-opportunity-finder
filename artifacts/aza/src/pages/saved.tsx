import { Bookmark, Construction } from 'lucide-react';
import DashboardShell from '@/components/dashboard-shell';

export default function Saved() {
  return (
    <DashboardShell>
      <h1 className="text-2xl font-extrabold text-foreground">Saved</h1>
      <p className="mt-1 text-sm text-muted-foreground">Opportunities you&apos;ve bookmarked to revisit later.</p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[hsl(32_95%_48%)]/30 bg-[hsl(32_95%_97%)] p-4">
        <Construction size={18} className="mt-0.5 shrink-0 text-[hsl(32_95%_45%)]" />
        <div>
          <p className="text-sm font-bold text-foreground">Not wired up yet</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            This screen shows the intended layout only. There&apos;s no database yet, so nothing you
            &ldquo;save&rdquo; is actually stored anywhere &mdash; it won&apos;t survive a refresh. Building this for
            real needs persistence (a database + user accounts), which hasn&apos;t been built.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white p-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-muted-foreground">
          <Bookmark size={20} />
        </span>
        <p className="mt-4 text-sm font-semibold text-foreground">Nothing saved</p>
        <p className="mt-1 text-xs text-muted-foreground">Opportunities you save will appear here once this is built.</p>
      </div>
    </DashboardShell>
  );
}
