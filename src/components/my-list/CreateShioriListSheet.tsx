import { useState } from 'react'
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
import { useMyListStore, MAX_SHIORI_LISTS, type ShioriCustomList, type ShioriListIcon } from '@/store/myListStore'
import { toPersianNumber } from '@/lib/myListUtils'
import { cn } from '@/lib/utils'
import { SHIORI_LIST_ICONS } from './listIcons'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'

type CreateShioriListSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (list: ShioriCustomList) => void
}

export const CreateShioriListSheet = ({
  open,
  onOpenChange,
  onCreated,
}: CreateShioriListSheetProps) => {
  const { showAlert } = useAppAuth()
  const createList = useMyListStore((s) => s.createList)
  const listCount = useMyListStore((s) => s.customLists.length)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<ShioriListIcon>('heart')

  const atLimit = listCount >= MAX_SHIORI_LISTS

  const reset = () => {
    setName('')
    setIcon('heart')
  }

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
    reset()
    onOpenChange(false)
    onCreated?.(created)
    showAlert('لیست ساخته شد')
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <SheetContent
        side="bottom"
        overlayClassName="z-[60]"
        className="z-[60] rounded-t-2xl border-t border-border bg-background p-0 pb-[var(--app-tg-bottom-inset)]"
      >
        <SheetHeader className="border-b border-border/50 px-4 py-3">
          <SheetTitle>ساخت لیست جدید</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 py-4">
          <div>
            <label htmlFor="list-name" className="mb-2 block text-sm font-semibold text-foreground">
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
            <p className="mb-2 text-sm font-semibold text-foreground">آیکون</p>
            <div className="flex flex-wrap gap-2">
              {SHIORI_LIST_ICONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setIcon(id)}
                  className={cn(
                    'inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors',
                    icon === id
                      ? 'border-primary-400/45 bg-primary-400/15 text-primary-300'
                      : 'border-border/60 bg-muted/35 text-muted-foreground hover:bg-muted/55 hover:text-foreground'
                  )}
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="flex-row gap-2 border-t border-border/50 px-4 py-4">
          <Button
            type="button"
            className={cn('h-11 flex-1', SHIORI_PRIMARY_BUTTON_CLASS)}
            disabled={atLimit}
            onClick={handleCreate}
          >
            ساخت
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1"
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
