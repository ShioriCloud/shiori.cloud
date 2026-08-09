import type { ComponentType } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Add01Icon, ArrowLeft01Icon } from 'hugeicons-react'
import { useMyListStore, MAX_SHIORI_LISTS, type ShioriListIcon } from '@/store/myListStore'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { toPersianNumber } from '@/lib/myListUtils'
import { cn } from '@/lib/utils'
import { getListIcon } from './listIcons'
import { CreateShioriListSheet } from './CreateShioriListSheet'
import {
  MyListCompactCard,
  MyListEmptyState,
  MyListTabHeader,
} from './MyListUi'

const CollectionPosterStack = ({
  images,
  fallbackIcon: FallbackIcon,
}: {
  images: string[]
  fallbackIcon: ComponentType<{ className?: string }>
}) => {
  const shown = images.slice(0, 3)
  if (shown.length === 0) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-primary-400/25 bg-primary-400/5">
        <FallbackIcon className="h-5 w-5 text-primary-300/70" />
      </div>
    )
  }

  return (
    <div className="relative h-14 w-[4.25rem] shrink-0">
      {shown.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={cn(
            'absolute top-0 h-14 w-10 overflow-hidden rounded-md',
            'border border-border/50 bg-muted ring-1 ring-black/20',
            'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5)]'
          )}
          style={{ insetInlineStart: `${i * 9}px`, zIndex: 3 - i }}
        >
          <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
        </div>
      ))}
    </div>
  )
}

const ShioriCollectionCard = ({
  id,
  name,
  icon,
  animeIds,
  previewImages,
}: {
  id: string
  name: string
  icon: ShioriListIcon
  animeIds: string[]
  previewImages: string[]
}) => {
  const { Icon } = getListIcon(icon)

  return (
    <MyListCompactCard className="group overflow-hidden">
      <Link
        to={`/my-list/lists/${id}`}
        className="flex items-center gap-2.5 p-2 active:opacity-90 transition-opacity"
        aria-label={`مشاهده لیست ${name}`}
      >
        <CollectionPosterStack images={previewImages} fallbackIcon={Icon} />

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 shrink-0 text-primary-300" aria-hidden />
            <h3 className="min-w-0 flex-1 text-sm font-semibold leading-5 text-foreground line-clamp-1">
              {name}
            </h3>
          </div>
          <p className="mt-1 text-xs tabular-nums text-muted-foreground">
            {toPersianNumber(animeIds.length)} انیمه
          </p>
        </div>

        <span
          className={cn(
            'inline-flex h-8 shrink-0 items-center justify-center gap-1 self-center rounded-md border px-2.5',
            'border-border/50 bg-muted/35 text-[11px] font-medium text-muted-foreground',
            'transition-colors group-hover:bg-muted/50 group-hover:text-foreground'
          )}
        >
          مشاهده
          <ArrowLeft01Icon className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
        </span>
      </Link>
    </MyListCompactCard>
  )
}

const CreateListCta = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3.5',
      'border-primary-400/30 bg-primary-400/[0.06] text-sm font-medium text-primary-300',
      'transition-colors hover:border-primary-400/45 hover:bg-primary-400/10 active:scale-[0.995]'
    )}
  >
    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary-400/30 bg-primary-400/10">
      <Add01Icon className="h-4 w-4" />
    </span>
    ساخت لیست جدید
  </button>
)

export const ShioriListsTab = () => {
  const customLists = useMyListStore((s) => s.customLists)
  const [createOpen, setCreateOpen] = useState(false)

  const allAnimeIds = useMemo(
    () => [...new Set(customLists.flatMap((l) => l.animeIds))],
    [customLists]
  )

  const { data: cards = [] } = useFavoriteAnimeCardsQuery(allAnimeIds)

  const imageById = useMemo(() => {
    const map = new Map<string, string>()
    for (const card of cards) map.set(String(card.id), card.image)
    return map
  }, [cards])

  const remaining = MAX_SHIORI_LISTS - customLists.length
  const atLimit = remaining <= 0

  if (customLists.length === 0) {
    return (
      <>
        <MyListEmptyState
          title="هنوز لیست شخصی نساختی"
          description={`تا ${toPersianNumber(MAX_SHIORI_LISTS)} لیست شخصی با نام و آیکون دلخواه بساز و انیمه‌هات رو دسته‌بندی کن.`}
          actionLabel="ساخت لیست جدید"
          onAction={() => setCreateOpen(true)}
        />
        <CreateShioriListSheet open={createOpen} onOpenChange={setCreateOpen} />
      </>
    )
  }

  return (
    <div className="space-y-3">
      <MyListTabHeader
        title="شیوری‌لیست"
        meta={
          atLimit
            ? 'لیست کامل'
            : `${toPersianNumber(remaining)} لیست باقی‌مانده`
        }
      />

      <div className="space-y-2">
        {customLists.map((list) => (
          <ShioriCollectionCard
            key={list.id}
            id={list.id}
            name={list.name}
            icon={list.icon}
            animeIds={list.animeIds}
            previewImages={list.animeIds
              .map((id) => imageById.get(id))
              .filter((src): src is string => Boolean(src))}
          />
        ))}
      </div>

      {!atLimit ? <CreateListCta onClick={() => setCreateOpen(true)} /> : null}

      <CreateShioriListSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
