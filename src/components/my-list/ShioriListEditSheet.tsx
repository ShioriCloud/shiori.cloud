import { useEffect, useState } from 'react'
import { Delete02Icon } from 'hugeicons-react'
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
import { useMyListStore, type ShioriListIcon } from '@/store/myListStore'
import { cn } from '@/lib/utils'
import { SHIORI_LIST_ICONS } from './listIcons'

export const EditListSheet = ({
  listId,
  open,
  onOpenChange,
  onDeleted,
}: {
  listId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}) => {
  const { showAlert } = useAppAuth()
  const list = useMyListStore((s) => s.customLists.find((l) => l.id === listId))
  const updateList = useMyListStore((s) => s.updateList)
  const deleteList = useMyListStore((s) => s.deleteList)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState<ShioriListIcon>('heart')

  useEffect(() => {
    if (!list || !open) return
    setName(list.name)
    setIcon(list.icon)
  }, [list, open])

  const handleSave = () => {
    if (!listId) return
    const trimmed = name.trim()
    if (!trimmed) {
      showAlert('نام لیست را وارد کنید')
      return
    }
    updateList(listId, { name: trimmed, icon })
    onOpenChange(false)
    showAlert('لیست به‌روز شد')
  }

  const handleDelete = () => {
    if (!listId) return
    deleteList(listId)
    onOpenChange(false)
    showAlert('لیست حذف شد')
    onDeleted?.()
  }

  if (!list) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t border-border bg-background p-0 pb-[var(--app-tg-bottom-inset)]"
      >
        <SheetHeader className="border-b border-border/50 px-4 py-3">
          <SheetTitle>ویرایش لیست</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 px-4 py-4">
          <div>
            <label htmlFor="edit-list-name" className="mb-2 block text-sm font-semibold text-foreground">
              نام لیست
            </label>
            <Input
              id="edit-list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-1.5 border-red-500/20 text-red-400 hover:text-red-400"
            onClick={handleDelete}
          >
            <Delete02Icon className="h-4 w-4" />
            حذف لیست
          </Button>
        </div>
        <SheetFooter className="flex-row gap-2 border-t border-border/50 px-4 py-4">
          <Button
            type="button"
            className="h-11 flex-1 bg-primary-500 hover:bg-primary-500/90"
            onClick={handleSave}
          >
            ذخیره
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
