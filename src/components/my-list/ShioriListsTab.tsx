import type { ComponentType } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft01Icon, Edit02Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useMyListStore, MAX_SHIORI_LISTS, type ShioriListIcon } from '@/store/myListStore'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { toPersianNumber } from '@/lib/myListUtils'
import { cn } from '@/lib/utils'
import { getListIcon, SHIORI_LIST_ICONS } from './listIcons'
import { EditListSheet } from './ShioriListEditSheet'
import {
  MyListCompactCard,
  MyListEmptyState,
  MyListTabHeader,
  MyListTextAction,
} from './MyListUi'

const CreateListSheet = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { showAlert } = useAppAuth()
  const createList = useMyListStore((s) => s.createList)
  const listCount = useMyListStore((s) => s.customLists.length)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<ShioriListIcon>('heart')

  const atLimit = listCount >= MAX_SHIORI_LISTS

  const handleCreate = () => {
    if (atLimit) {
      showAlert(`حداکثر ${toPersianNumber(MAX_SHIORI_LISTS)} لیست می‌توانید بسازید`)
      return
    }
    const trimmed = name.trim()
    if (!trimmed) {
      showAlert('نام لیست را وارد کنید')
      return
    }
    const created = createList(trimmed, icon)
    if (!created) {
      showAlert('ساخت لیست ناموفق بود')
      return
    }
    setName('')
    setIcon('heart')
    onOpenChange(false)
    showAlert('لیست ساخته شد')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>ساخت لیست جدید</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <div>
            <label htmlFor="list-name" className="text-xs text-muted-foreground mb-1.5 block">
              نام لیست
            </label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثلاً انیمه‌های تابستان"
              maxLength={48}
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">آیکون</p>
            <div className="flex flex-wrap gap-2">
              {SHIORI_LIST_ICONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setIcon(id)}
                  className={cn(
                    'rounded-lg border p-2.5 transition-colors',
                    icon === id
                      ? 'border-primary-400/50 bg-primary-400/15 text-primary-400'
                      : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'
                  )}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="gap-2 flex-row">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button
            type="button"
            className="flex-1 bg-primary-500 hover:bg-primary-500/90"
            disabled={atLimit}
            onClick={handleCreate}
          >
            ساخت
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

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
      <div className="flex h-[4.25rem] w-[4.25rem] shrink-0 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/20">
        <FallbackIcon className="h-5 w-5 text-primary-400/50" />
      </div>
    )
  }

  return (
    <div className="relative h-[4.25rem] w-[4.75rem] shrink-0">
      {shown.map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="absolute top-0 w-9 aspect-[2/3] overflow-hidden rounded-md border border-border/80 bg-muted shadow-sm"
          style={{ insetInlineStart: `${i * 11}px`, zIndex: 3 - i }}
        >
          <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
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
  onEdit,
}: {
  id: string
  name: string
  icon: ShioriListIcon
  animeIds: string[]
  previewImages: string[]
  onEdit: () => void
}) => {
  const { Icon } = getListIcon(icon)

  return (
    <MyListCompactCard className="group overflow-hidden">
      <Link
        to={`/my-list/lists/${id}`}
        className="block p-2.5 active:scale-[0.995] transition-transform"
        aria-label={`مشاهده لیست ${name}`}
      >
        <div className="flex items-center gap-3">
          <CollectionPosterStack images={previewImages} fallbackIcon={Icon} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 text-right flex-1">
                <h3 className="text-sm font-semibold text-foreground line-clamp-1">{name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                  {toPersianNumber(animeIds.length)} انیمه
                </p>
              </div>
              <button
                type="button"
                aria-label="ویرایش لیست"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onEdit()
                }}
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                <Edit02Icon className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-primary-400 font-medium">
              <span>مشاهده مجموعه</span>
              <ArrowLeft01Icon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </MyListCompactCard>
  )
}

export const ShioriListsTab = () => {
  const customLists = useMyListStore((s) => s.customLists)
  const [createOpen, setCreateOpen] = useState(false)
  const [editListId, setEditListId] = useState<string | null>(null)

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
        <CreateListSheet open={createOpen} onOpenChange={setCreateOpen} />
      </>
    )
  }

  return (
    <div className="space-y-2">
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
            onEdit={() => setEditListId(list.id)}
          />
        ))}
      </div>

      {!atLimit && (
        <MyListTextAction onClick={() => setCreateOpen(true)}>
          + ساخت لیست جدید
        </MyListTextAction>
      )}

      <CreateListSheet open={createOpen} onOpenChange={setCreateOpen} />
      <EditListSheet
        listId={editListId}
        open={Boolean(editListId)}
        onOpenChange={(open) => {
          if (!open) setEditListId(null)
        }}
      />
    </div>
  )
}
