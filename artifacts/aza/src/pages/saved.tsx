import { Bookmark, CalendarClock, Loader2, TriangleAlert, X } from 'lucide-react';
import { Link } from 'wouter';
import { useGetSavedOpportunities, useUnsaveOpportunity, getGetSavedOpportunitiesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import DashboardShell from '@/components/dashboard-shell';
import { getDeviceId } from '@/lib/device-id';

function daysUntil(deadline: string | Date): number {
  const date = typeof deadline === 'string' ? deadline : deadline.toISOString();
  return Math.ceil((Date.parse(`${date.slice(0, 10)}T23:59:59Z`) - Date.now()) / 86_400_000);
}

export default function Saved() {
  const deviceId = getDeviceId();
  const queryClient = useQueryClient();
  const queryKey = getGetSavedOpportunitiesQueryKey({ deviceId });

  const { data, isLoading, isError } = useGetSavedOpportunities(
    { deviceId },
    { query: { enabled: Boolean(deviceId), queryKey } },
  );

  const unsave = useUnsaveOpportunity({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    },
  });

  const opportunities = data?.opportunities ?? [];

  return (
    <DashboardShell>
      <h1 className="text-2xl font-extrabold text-foreground">Saved</h1>
      <p className="mt-1 text-sm text-muted-foreground">Opportunities you&apos;ve bookmarked to revisit later.</p>

      {isLoading && (
        <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white p-12 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" /> Loading your saved opportunities&hellip;
        </div>
      )}

      {isError && !isLoading && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/5 p-4">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-[hsl(var(--destructive))]" />
          <div>
            <p className="text-sm font-bold text-foreground">Couldn&apos;t load your saved opportunities</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Check your connection and try refreshing the page.</p>
          </div>
        </div>
      )}

      {!isLoading && !isError && opportunities.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-[hsl(var(--border))] bg-white p-12 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-muted-foreground">
            <Bookmark size={20} />
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">Nothing saved yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Save an opportunity from its detail page and it&apos;ll show up here.</p>
        </div>
      )}

      {!isLoading && opportunities.length > 0 && (
        <div className="mt-6 space-y-3">
          {opportunities.map((item) => {
            const remaining = daysUntil(item.deadline as unknown as string);
            return (
              <div
                key={item.id}
                data-testid={`row-saved-${item.id}`}
                className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-white p-4"
              >
                <Link href={`/opportunities/${item.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-xs font-bold text-muted-foreground">
                    {item.organization.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-foreground">{item.title}</p>
                      <span className="shrink-0 rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {item.category}
                      </span>
                      {item.demoData && (
                        <span className="shrink-0 rounded-full bg-[hsl(32_95%_95%)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(32_95%_40%)]">
                          Demo data
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>{item.onlineAvailability ? 'Online' : 'In-person'}</span>
                      <span className="flex items-center gap-1">
                        <CalendarClock size={11} />
                        {remaining < 0 ? 'Closed' : `${remaining} days left`}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  data-testid={`button-unsave-${item.id}`}
                  aria-label={`Remove ${item.title} from saved`}
                  disabled={unsave.isPending}
                  onClick={() => unsave.mutate({ opportunityId: item.id, data: { deviceId } })}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--destructive))] disabled:opacity-50"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
