import { useMemo, useState } from 'react'
import { Add01Icon, Bookmark02Icon, Tick02Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useMyListStore, MAX_SHIORI_LISTS } from '@/store/myListStore'
import { toPersianNumber } from '@/lib/myListUtils'
import { getListIcon } from './listIcons'
import { cn } from '@/lib/utils'

type Props = {
  animeId: string | number
  triggerClassName?: string
  /** Compact icon trigger for poster overlays / button groups. */
  iconOnly?: boolean
}

export const AddToShioriListButton = ({ animeId, triggerClassName, iconOnly }: Props) => {
  const { showAlert } = useAppAuth()
  const customLists = useMyListStore((s) => s.customLists)
  const addAnimeToList = useMyListStore((s) => s.addAnimeToList)
  const removeAnimeFromList = useMyListStore((s) => s.removeAnimeFromList)
  const [open, setOpen] = useState(false)

  const key = String(animeId)
  const memberListIds = useMemo(
    () => new Set(customLists.filter((l) => l.animeIds.includes(key)).map((l) => l.id)),
    [customLists, key]
  )
  const inAnyList = memberListIds.size > 0

  const toggleList = (listId: string) => {
    if (memberListIds.has(listId)) {
      removeAnimeFromList(listId, key)
      showAlert('از لیست حذف شد')
      return
    }
    addAnimeToList(listId, key)
    showAlert('به لیست اضافه شد')
  }

  if (customLists.length === 0) return null

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

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-t border-border bg-background p-0 pb-[var(--app-tg-bottom-inset)]"
        >
          <SheetHeader className="border-b border-border/50 px-4 py-3">
            <SheetTitle>افزودن به شیوری‌لیست</SheetTitle>
          </SheetHeader>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto px-4 py-4 scrollbar-none">
            {customLists.map((list) => {
              const selected = memberListIds.has(list.id)
              const { Icon } = getListIcon(list.icon)
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => toggleList(list.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-start transition-colors',
                    selected
                      ? 'border-primary-400/45 bg-primary-400/10'
                      : 'border-border/60 bg-muted/20 hover:bg-muted/40 active:scale-[0.99]'
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary-400/30 bg-primary-400/10 text-primary-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium text-foreground">{list.name}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                      {toPersianNumber(list.animeIds.length)} انیمه
                    </p>
                  </div>
                  {selected ? (
                    <Tick02Icon className="h-5 w-5 shrink-0 text-primary-400" />
                  ) : (
                    <Add01Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </button>
              )
            })}
          </div>
          <SheetFooter className="border-t border-border/50 px-4 py-3">
            <p className="w-full text-center text-[11px] leading-relaxed text-muted-foreground">
              حداکثر {toPersianNumber(MAX_SHIORI_LISTS)} لیست · از «لیست من» لیست جدید بساز
            </p>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
