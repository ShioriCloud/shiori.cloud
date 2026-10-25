import { Link } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { getListIcon } from '@/components/my-list/listIcons'
import { useCustomLists } from '@/hooks/useCustomLists'
import { useAppAuth } from '@/hooks/useAppAuth'
import { SOCIAL_DIVIDER_CLASS, SOCIAL_SURFACE_CLASS } from '@/components/profile/social/socialUi'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import { PersonalSection } from './PersonalSection'
import { CreateShioriListSheet } from '@/components/my-list/CreateShioriListSheet'
import { useState } from 'react'

export const PersonalPlaylistsBlock = () => {
  const { showAlert } = useAppAuth()
  const { customLists, updateList, isMutating } = useCustomLists({ syncRemote: false })
  const [createOpen, setCreateOpen] = useState(false)

  const togglePublic = async (listId: string, next: boolean) => {
    try {
      await updateList(listId, { isPublic: next })
      showAlert(next ? 'لیست عمومی شد — در تب پلی‌لیست‌های پروفایل دیده می‌شود' : 'لیست خصوصی شد')
    } catch {
      showAlert('تغییر وضعیت ناموفق بود')
    }
  }

  return (
    <PersonalSection
      title="پلی‌لیست‌ها"
      subtitle="لیست‌های شخصی — عمومی را دیگران در پروفایلت می‌بینند"
      accent="violet"
      action={
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-9 items-center gap-1 rounded-xl border border-violet-400/30 bg-violet-400/10 px-2.5 text-xs font-semibold text-violet-700 dark:text-violet-200"
        >
          <Plus className="h-3.5 w-3.5" />
          جدید
        </button>
      }
    >
      {customLists.length === 0 ? (
        <div
          className={cn(
            SOCIAL_SURFACE_CLASS,
            'px-4 py-8 text-center text-sm text-muted-foreground'
          )}
        >
          هنوز پلی‌لیستی نساختی.
        </div>
      ) : (
        <div className={cn(SOCIAL_SURFACE_CLASS, SOCIAL_DIVIDER_CLASS, 'overflow-hidden')}>
          {customLists.map((list) => {
            const { Icon } = getListIcon(list.icon)
            const isPublic = list.isPublic === true
            return (
              <div
                key={list.id}
                className="flex items-center gap-3 border-b border-border/40 px-3 py-3 last:border-0"
              >
                <Link
                  to={`/my-list/lists/${list.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-600 dark:text-violet-300"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-right">
                    <span className="block text-sm font-medium text-foreground">{list.name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {toPersianDigits(list.animeIds.length)} انیمه
                      {isPublic ? ' · عمومی' : ' · خصوصی'}
                    </span>
                  </span>
                  <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                </Link>
                <div className="flex shrink-0 flex-col items-center gap-0.5">
                  <Switch
                    checked={isPublic}
                    disabled={isMutating}
                    onCheckedChange={(v) => void togglePublic(list.id, v)}
                    aria-label={`عمومی کردن ${list.name}`}
                  />
                  <span className="text-[9px] text-muted-foreground">عمومی</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CreateShioriListSheet open={createOpen} onOpenChange={setCreateOpen} />
    </PersonalSection>
  )
}
