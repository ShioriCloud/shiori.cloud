import { useEffect, useMemo, useState } from 'react'
import { Bookmark02Icon, Search01Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useFavoriteAnimeCardsQuery } from '@/hooks/queries/useAnimeQueries'
import { useMyListStore, MAX_SHIORI_LISTS } from '@/store/myListStore'
import { toPersianNumber } from '@/lib/myListUtils'
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'
import emptyListImage from '@/assets/images/frieren-03.webp'
import { CreateShioriListSheet } from './CreateShioriListSheet'

type Props = {
  animeId: string | number
  triggerClassName?: string
  /** Compact icon trigger for poster overlays / button groups. */
  iconOnly?: boolean
}

const ListPosterGrid = ({ images }: { images: string[] }) => {
  const cells = Array.from({ length: 4 }, (_, i) => images[i] ?? null)
  return (
    <div className="grid aspect-square grid-cols-2 gap-0.5 overflow-hidden rounded-lg bg-muted/60">
      {cells.map((src, i) =>
        src ? (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div key={`empty-${i}`} className="bg-background/80" />
        )
      )}
    </div>
  )
}

export const AddToShioriListButton = ({ animeId, triggerClassName, iconOnly }: Props) => {
  const { showAlert } = useAppAuth()
  const customLists = useMyListStore((s) => s.customLists)
  const addAnimeToList = useMyListStore((s) => s.addAnimeToList)
  const removeAnimeFromList = useMyListStore((s) => s.removeAnimeFromList)
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [draftSelected, setDraftSelected] = useState<Set<string>>(() => new Set())

  const key = String(animeId)
  const memberListIds = useMemo(
    () => new Set(customLists.filter((l) => l.animeIds.includes(key)).map((l) => l.id)),
    [customLists, key]
  )
  const inAnyList = memberListIds.size > 0
  const atLimit = customLists.length >= MAX_SHIORI_LISTS

  useEffect(() => {
    if (!open) return
    setDraftSelected(new Set(memberListIds))
    setQuery('')
  }, [open, memberListIds])

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

  const filteredLists = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customLists
    return customLists.filter((l) => l.name.toLowerCase().includes(q))
  }, [customLists, query])

  const draftDirty = useMemo(() => {
    if (draftSelected.size !== memberListIds.size) return true
    for (const id of draftSelected) {
      if (!memberListIds.has(id)) return true
    }
    return false
  }, [draftSelected, memberListIds])

  const toggleDraft = (listId: string) => {
    hapticSelection()
    setDraftSelected((prev) => {
      const next = new Set(prev)
      if (next.has(listId)) next.delete(listId)
      else next.add(listId)
      return next
    })
  }

  const handleApply = () => {
    for (const list of customLists) {
      const want = draftSelected.has(list.id)
      const has = memberListIds.has(list.id)
      if (want && !has) addAnimeToList(list.id, key)
      if (!want && has) removeAnimeFromList(list.id, key)
    }
    setOpen(false)
    showAlert(draftSelected.size > 0 ? 'لیست‌ها به‌روز شد' : 'از لیست‌ها حذف شد')
  }

  const openCreate = () => {
    if (atLimit) {
      showAlert(`حداکثر ${toPersianNumber(MAX_SHIORI_LISTS)} لیست می‌توانید بسازید`)
      return
    }
    hapticSelection()
    setCreateOpen(true)
  }

  return (
    <>
      <Button
        type="button"
        size={iconOnly ? 'icon-sm' : 'sm'}
        variant={iconOnly ? 'outline' : 'secondary'}
        className={cn(
          iconOnly
            ? 'border-border/60 text-muted-foreground hover:text-foreground'
            : 'gap-1.5 border border-primary-400/20 bg-primary-400/5 text-foreground hover:bg-primary-400/10',
          inAnyList && iconOnly && 'text-primary-400',
          triggerClassName
        )}
        onClick={() => setOpen(true)}
        aria-label="افزودن به لیست"
      >
        <Bookmark02Icon className={cn('h-4 w-4', !iconOnly && 'text-primary-400')} />
        {iconOnly ? null : 'افزودن به لیست'}
      </Button>

      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery('')
        }}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-t border-border bg-background p-0 pb-[var(--app-tg-bottom-inset)]"
        >
          <SheetHeader className="border-b border-border/50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="min-w-0 flex-1 text-start">افزودن به لیست</SheetTitle>
              <Button
                type="button"
                size="sm"
                className={cn('h-9 shrink-0 px-3 text-xs font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
                disabled={atLimit}
                onClick={openCreate}
              >
                ساخت لیست جدید
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-4 px-4 py-4">
            <div className="relative">
              <Search01Icon className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو در لیست‌ها…"
                className="ps-10"
                disabled={customLists.length === 0}
              />
            </div>

            {customLists.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-2 py-8 text-center">
                <img src={emptyListImage} alt="" className="mb-4 w-32 opacity-90" />
                <p className="text-sm font-semibold text-foreground">هنوز لیستی نداری</p>
                <p className="mt-1.5 max-w-xs text-xs leading-6 text-muted-foreground">
                  یک لیست شخصی بساز تا این انیمه را به آن اضافه کنی.
                </p>
                <Button
                  type="button"
                  size="lg"
                  className={cn('mt-5 h-11 px-6 font-bold', SHIORI_PRIMARY_BUTTON_CLASS)}
                  onClick={openCreate}
                >
                  ساخت لیست جدید
                </Button>
              </div>
            ) : filteredLists.length === 0 ? (
              <div className="px-2 py-10 text-center">
                <p className="text-sm font-medium text-foreground">لیستی پیدا نشد</p>
                <p className="mt-1 text-xs text-muted-foreground">عبارت جستجو را تغییر بده.</p>
              </div>
            ) : (
              <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-none">
                <div className="flex w-max gap-2.5">
                  {filteredLists.map((list) => {
                    const selected = draftSelected.has(list.id)
                    const images = list.animeIds
                      .map((id) => imageById.get(id))
                      .filter((src): src is string => Boolean(src))
                      .slice(0, 4)
                    return (
                      <button
                        key={list.id}
                        type="button"
                        onClick={() => toggleDraft(list.id)}
                        aria-pressed={selected}
                        className={cn(
                          'w-[7.25rem] shrink-0 rounded-xl border p-2 text-start transition-colors',
                          selected
                            ? 'border-primary-400 bg-primary-400/10'
                            : 'border-border/70 bg-card hover:bg-muted/30'
                        )}
                      >
                        <ListPosterGrid images={images} />
                        <p className="mt-2 line-clamp-1 text-sm font-semibold text-foreground">
                          {list.name}
                        </p>
                        <p className="mt-0.5 text-[11px] tabular-nums text-muted-foreground">
                          {toPersianNumber(list.animeIds.length)} انیمه
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {customLists.length > 0 ? (
            <SheetFooter className="border-t border-border/50 px-4 py-4">
              <Button
                type="button"
                size="lg"
                disabled={!draftDirty}
                className={cn('h-12 w-full text-base font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
                onClick={handleApply}
              >
                افزودن به لیست‌ها
              </Button>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>

      <CreateShioriListSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(list) => {
          setDraftSelected((prev) => new Set(prev).add(list.id))
        }}
      />
    </>
  )
}
