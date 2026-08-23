import { Construction, FileText } from 'lucide-react';
import DashboardShell from '@/components/dashboard-shell';

export default function Resources() {
  return (
    <DashboardShell>
      <h1 className="text-2xl font-extrabold text-foreground">Resources</h1>
      <p className="mt-1 text-sm text-muted-foreground">Guides on applications, essays, and interviews.</p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[hsl(32_95%_48%)]/30 bg-[hsl(32_95%_97%)] p-4">
        <Construction size={18} className="mt-0.5 shrink-0 text-[hsl(32_95%_45%)]" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-bold text-foreground">Not built yet.</span> No resource content exists behind this page yet.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white p-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-muted-foreground">
          <FileText size={20} />
        </span>
        <p className="mt-4 text-sm font-semibold text-foreground">No resources yet</p>
      </div>
    </DashboardShell>
  );
}
