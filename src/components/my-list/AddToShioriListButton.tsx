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
}

export const AddToShioriListButton = ({ animeId, triggerClassName }: Props) => {
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
        size="sm"
        variant="secondary"
        className={cn(
          'gap-1.5 border border-primary-400/20 bg-primary-400/5 hover:bg-primary-400/10 text-foreground',
          triggerClassName
        )}
        onClick={() => setOpen(true)}
      >
        <Bookmark02Icon className="h-4 w-4 text-primary-400" />
        افزودن به لیست
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>افزودن به شیوری‌لیست</SheetTitle>
          </SheetHeader>
          <div className="py-2 space-y-2 max-h-[50vh] overflow-y-auto scrollbar-none">
            {customLists.map((list) => {
              const selected = memberListIds.has(list.id)
              const { Icon } = getListIcon(list.icon)
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => toggleList(list.id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-2xl border px-3 py-3 text-start transition-all duration-200',
                    selected
                      ? 'border-primary-400/50 bg-primary-400/10 shadow-sm shadow-primary-400/10'
                      : 'border-border/60 bg-muted/20 hover:bg-muted/40 active:scale-[0.99]'
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary-400/30 bg-gradient-to-br from-primary-400/20 to-primary-400/5 text-primary-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground line-clamp-1">{list.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                      {toPersianNumber(list.animeIds.length)} انیمه
                    </p>
                  </div>
                  {selected ? (
                    <Tick02Icon className="h-5 w-5 text-primary-400 shrink-0" />
                  ) : (
                    <Add01Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
          <SheetFooter>
            <p className="text-[11px] text-muted-foreground text-center w-full leading-relaxed">
              حداکثر {toPersianNumber(MAX_SHIORI_LISTS)} لیست · از «لیست من» لیست جدید بساز
            </p>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
