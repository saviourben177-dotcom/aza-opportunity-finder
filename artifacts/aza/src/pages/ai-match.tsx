import { Construction, Send, Sparkles } from 'lucide-react';
import DashboardShell from '@/components/dashboard-shell';

export default function AiMatch() {
  return (
    <DashboardShell>
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-extrabold text-foreground">AI Match</h1>
        <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-bold uppercase text-white">Beta</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Ask Aza anything about opportunities.</p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[hsl(32_95%_48%)]/30 bg-[hsl(32_95%_97%)] p-4">
        <Construction size={18} className="mt-0.5 shrink-0 text-[hsl(32_95%_45%)]" />
        <div>
          <p className="text-sm font-bold text-foreground">Not functional</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            This is a static mockup of the chat interface only. There is no chat backend, no LLM call,
            and no connection to the real eligibility engine here yet. The input below does not do
            anything.
          </p>
        </div>
      </div>

      <div className="mt-8 flex min-h-[420px] flex-col rounded-2xl border border-[hsl(var(--border))] bg-white">
        <div className="flex-1 space-y-4 p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
              <Sparkles size={15} />
            </span>
            <div className="max-w-md rounded-2xl rounded-tl-sm bg-[hsl(var(--muted))] px-4 py-3 text-sm text-foreground">
              Hi! I&apos;m Aza AI. Ask me anything about opportunities.
            </div>
          </div>
        </div>
        <div className="border-t border-[hsl(var(--border))] p-4">
          <div className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-2.5">
            <input
              disabled
              placeholder="This doesn't work yet"
              data-testid="input-ai-match-disabled"
              className="flex-1 bg-transparent text-sm text-muted-foreground outline-none placeholder:text-muted-foreground/60"
            />
            <button
              type="button"
              disabled
              data-testid="button-ai-match-send-disabled"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-muted-foreground"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
