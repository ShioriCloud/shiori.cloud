import { useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import FavoriteAnimeEditor from '@/components/FavoriteAnimeEditor'
import { ProfileAnimeMediaRow, ProfileAnimeScore } from '@/components/profile/ProfileAnimeMediaRow'
import { hapticSelection } from '@/lib/telegramHaptics'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useAppAuth } from '@/hooks/useAppAuth'
import { hasTrackedProgress, useUserAnimeList } from '@/hooks/useUserAnimeList'
import { animeDetailPath, animePublicSegment } from '@/lib/animePaths'
import { formatStatusDateFa } from '@/lib/formatStatusDate'
import {
  deriveWatchStatus,
  formatUserRatingFa,
  PROFILE_WATCH_STATUSES,
  WATCH_STATUS_LABELS,
  type WatchStatus,
} from '@/lib/myListUtils'
import { formatUserListSaveError } from '@/services/userListErrors'
import type { FavoriteProgress } from '@/store/animeStore'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'
import { PersonalSection } from './PersonalSection'

export const PersonalWatchArchive = ({ embedded = false }: { embedded?: boolean }) => {
  const { showAlert } = useAppAuth()
  const { listAnimeIds, favoriteProgress, saveProgress, clearListTracking, isSaving } =
    useUserAnimeList()
  const { data: cards = [], isLoading } = useFavoriteAnimeCardsQuery(listAnimeIds)
  const [statusTab, setStatusTab] = useState<WatchStatus>('watching')
  const [editingId, setEditingId] = useState<string | null>(null)

  const byId = useMemo(() => new Map(cards.map((c) => [String(c.id), c])), [cards])

  const rows = useMemo(() => {
    return listAnimeIds
      .map((id) => {
        const key = String(id)
        const progress = favoriteProgress[key]
        if (!progress || !hasTrackedProgress(progress)) return null
        const card = byId.get(key)
        if (!card) return null
        const episodesCount =
          typeof card.episodes_count === 'number' && card.episodes_count > 0
            ? card.episodes_count
            : 1
        const status = deriveWatchStatus(progress, episodesCount)
        return {
          id,
          card,
          progress,
          status,
          episodesCount,
          statusDate: formatStatusDateFa(progress.listStatusUpdatedAt),
        }
      })
      .filter((row): row is NonNullable<typeof row> => row != null)
  }, [listAnimeIds, favoriteProgress, byId])

  const counts = useMemo(() => {
    const map = new Map<WatchStatus, number>()
    for (const s of PROFILE_WATCH_STATUSES) map.set(s, 0)
    for (const row of rows) {
      map.set(row.status, (map.get(row.status) ?? 0) + 1)
    }
    return map
  }, [rows])

  const filtered = rows.filter((r) => r.status === statusTab)
  const editing = rows.find((row) => String(row.id) === editingId) ?? null

  const handleSave = async (progress: FavoriteProgress) => {
    if (!editing) return
    try {
      await saveProgress(editing.id, progress)
      setEditingId(null)
      showAlert('ذخیره شد')
    } catch (e) {
      showAlert(formatUserListSaveError(e))
    }
  }

  const handleRemove = async () => {
    if (!editing) return
    try {
      await clearListTracking(editing.id)
      setEditingId(null)
      showAlert('از لیست تماشا حذف شد')
    } catch (e) {
      showAlert(formatUserListSaveError(e))
    }
  }

  const tabs = PROFILE_WATCH_STATUSES.map((id) => ({
    id,
    label: WATCH_STATUS_LABELS[id],
  }))

  const body = (
    <>
      <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" dir="rtl">
        <div className="flex w-max gap-1.5 pb-0.5" role="tablist" aria-label="وضعیت تماشا">
          {tabs.map((tab) => {
            const active = tab.id === statusTab
            const count = counts.get(tab.id) ?? 0
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  if (active) return
                  hapticSelection()
                  setStatusTab(tab.id)
                }}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium',
                  active
                    ? 'bg-primary-500 text-white'
                    : 'border border-border/80 bg-card text-foreground/75'
                )}
              >
                {tab.label}
                <span className={cn('tabular-nums', active ? 'text-white/80' : 'text-foreground/45')}>
                  {toPersianDigits(count)}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {isLoading && listAnimeIds.length > 0 ? (
        <p className="px-4 py-8 text-center text-sm text-foreground/60">در حال بارگذاری…</p>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-foreground/60">
          در این وضعیت انیمه‌ای نداری.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((row) => {
            const routeRef = { id: row.card.id, slug: row.card.slug, title: row.card.title }
            return (
              <li key={String(row.id)}>
                <ProfileAnimeMediaRow
                  animeId={animePublicSegment(routeRef)}
                  to={animeDetailPath(routeRef)}
                  image={row.card.image}
                  title={row.card.title}
                  meta={
                    <>
                      <span>
                        {toPersianDigits(row.progress.episodesWatched)}/
                        {toPersianDigits(row.episodesCount)} قسمت
                      </span>
                      {row.statusDate ? (
                        <>
                          <span className="size-1 rounded-full bg-foreground/30" aria-hidden />
                          <span>{row.statusDate}</span>
                        </>
                      ) : null}
                      {typeof row.progress.userRating === 'number' ? (
                        <ProfileAnimeScore value={formatUserRatingFa(row.progress.userRating)} />
                      ) : null}
                    </>
                  }
                  action={
                    <button
                      type="button"
                      aria-label={`ویرایش وضعیت ${row.card.title}`}
                      onClick={() => {
                        hapticSelection()
                        setEditingId(String(row.id))
                      }}
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-card text-foreground active:opacity-80"
                    >
                      <Pencil className="size-3.5" aria-hidden />
                    </button>
                  }
                />
              </li>
            )
          })}
        </ul>
      )}

      {editing ? (
        <FavoriteAnimeEditor
          open
          onOpenChange={(open) => {
            if (!open) setEditingId(null)
          }}
          title={editing.card.title}
          titleRomaji={editing.card.title_romaji}
          image={editing.card.image}
          detailHref={animeDetailPath({
            id: editing.card.id,
            slug: editing.card.slug,
            title: editing.card.title,
          })}
          episodesCount={editing.episodesCount}
          progress={editing.progress}
          saving={isSaving}
          onSave={(progress) => void handleSave(progress)}
          onRemove={() => void handleRemove()}
        />
      ) : null}
    </>
  )

  if (embedded) return <div className="space-y-3">{body}</div>

  return (
    <PersonalSection
      title="آرشیو تماشای من"
      subtitle="بر اساس وضعیت ثبت‌شده در پیشرفت تماشا"
      accent="amber"
    >
      {body}
    </PersonalSection>
  )
}
