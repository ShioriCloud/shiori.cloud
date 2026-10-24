import { Link } from 'react-router-dom'
import { UserIcon } from 'hugeicons-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useSocialFollowMutation } from '@/hooks/useSocialProfile'
import { hapticSelection } from '@/lib/telegramHaptics'
import { fetchSocialFollowSuggestions } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

const SuggestionFollowButton = ({ targetId }: { targetId: string }) => {
  const queryClient = useQueryClient()
  const { follow, isPending } = useSocialFollowMutation(targetId)

  return (
    <Button
      type="button"
      size="sm"
      className="shrink-0 text-xs"
      disabled={isPending}
      onClick={() => {
        hapticSelection()
        void follow.mutateAsync().then(() => {
          void queryClient.invalidateQueries({ queryKey: ['user-social-profile', 'suggestions'] })
        })
      }}
    >
      دنبال کردن
    </Button>
  )
}

export const ProfileFollowSuggestions = ({ enabled = true }: { enabled?: boolean }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['user-social-profile', 'suggestions'] as const,
    queryFn: () => fetchSocialFollowSuggestions(8),
    enabled,
    staleTime: 60_000,
  })

  if (!enabled || data?.enabled === false) return null
  if (!isLoading && (!data?.items || data.items.length === 0)) return null

  const items = data?.items ?? []

  return (
    <section className="mb-4 rounded-2xl border border-border/50 bg-card/40">
      <h3 className="px-3 pt-3 text-sm font-semibold text-foreground">پیشنهاد دنبال کردن</h3>
      {isLoading ? (
        <p className="px-3 py-4 text-xs text-muted-foreground">در حال بارگذاری…</p>
      ) : (
        <ul className="divide-y divide-border/40">
          {items.map((user) => (
            <li key={user.telegram_user_id} className="flex items-center gap-2 px-2 py-2">
              <Link
                to={`/u/${encodeURIComponent(user.telegram_user_id)}`}
                className={cn(
                  'flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1',
                  'transition-colors hover:bg-muted/40 active:bg-muted/55'
                )}
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
                  {user.photo_url ? (
                    <img src={user.photo_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <UserIcon className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 text-right">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user.display_name}
                  </p>
                  {user.mutual_connections > 0 ? (
                    <p className="truncate text-xs text-muted-foreground">
                      {user.mutual_connections.toLocaleString('fa-IR')} نفر از دنبال‌شده‌هایت
                    </p>
                  ) : null}
                </div>
              </Link>
              <SuggestionFollowButton targetId={user.telegram_user_id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
