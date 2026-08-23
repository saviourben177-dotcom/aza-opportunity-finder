import { Construction } from 'lucide-react';
import DashboardShell from '@/components/dashboard-shell';

export default function Settings() {
  return (
    <DashboardShell>
      <h1 className="text-2xl font-extrabold text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences.</p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[hsl(32_95%_48%)]/30 bg-[hsl(32_95%_97%)] p-4">
        <Construction size={18} className="mt-0.5 shrink-0 text-[hsl(32_95%_45%)]" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-bold text-foreground">Not functional.</span> There are no user accounts yet, so
          there&apos;s nothing here to actually manage. Your last profile submission lives only in this browser&apos;s
          session storage.
        </p>
      </div>
    </DashboardShell>
  );
}
