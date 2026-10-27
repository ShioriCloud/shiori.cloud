import { Link } from 'react-router-dom'
import {
  Archive,
  Heart,
  Languages,
  ListMusic,
  MessageSquareText,
  Settings,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useAnimeCommentsAccess, useMyAnimeCommentsQuery } from '@/hooks/useAnimeComments'
import { useCustomLists } from '@/hooks/useCustomLists'
import { hasTrackedProgress, useUserAnimeList } from '@/hooks/useUserAnimeList'
import { toPersianDigits } from '@/lib/persianDigits'
import type { SocialProfileMe } from '@/services/socialProfile'
import { cn } from '@/lib/utils'

type RowProps = {
  to: string
  icon: React.ReactNode
  label: string
  hint: string
  iconClass?: string
  onNavigate?: () => void
}

const ToolRow = ({ to, icon, label, hint, iconClass, onNavigate }: RowProps) => (
  <Link
    to={to}
    onClick={onNavigate}
    className={cn(
      'flex items-center gap-3 px-4 py-3.5',
      'transition-colors hover:bg-muted/40 active:bg-muted/55'
    )}
  >
    <span
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
        iconClass ?? 'border-border/50 bg-muted/35 text-muted-foreground'
      )}
    >
      {icon}
    </span>
    <span className="min-w-0 flex-1 text-right">
      <span className="block text-sm font-medium text-foreground">{label}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
    </span>
  </Link>
)

type ProfileToolsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  translator?: SocialProfileMe['translator'] | null
  profileUserId?: string
}

export const ProfileToolsSheet = ({
  open,
  onOpenChange,
  translator,
  profileUserId,
}: ProfileToolsSheetProps) => {
  const { user } = useAppAuth()
  const { data: commentsAccess } = useAnimeCommentsAccess(Boolean(user))
  const commentsEnabled = commentsAccess?.enabled === true
  const myComments = useMyAnimeCommentsQuery(Boolean(user) && commentsEnabled && open, 1, 1)
  const { favoriteAnime, favoriteProgress } = useUserAnimeList({ syncRemoteList: false })
  const { customLists } = useCustomLists({ syncRemote: false })

  const translationsPath =
    profileUserId && translator
      ? `/u/${encodeURIComponent(profileUserId)}/translations`
      : translator
        ? `/translators/${encodeURIComponent(translator.slug)}`
        : null

  const archiveCount = Object.values(favoriteProgress).filter((p) => hasTrackedProgress(p)).length
  const publicListCount = customLists.filter((l) => l.isPublic).length
  const close = () => onOpenChange(false)

  const commentHint =
    myComments.isLoading
      ? 'در حال بارگذاری…'
      : (myComments.data?.total ?? 0) > 0
        ? `${toPersianDigits(myComments.data?.total ?? 0)} نظر`
        : 'نظرها و پاسخ‌هایت'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] rounded-t-3xl border-border/60 bg-background px-0 pb-8 pt-3"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
        <SheetHeader className="mb-2 px-4 text-right">
          <SheetTitle className="text-base font-semibold">ابزارهای پروفایل</SheetTitle>
        </SheetHeader>
        <div className="divide-y divide-border/50">
          <ToolRow
            to="/profile/settings"
            icon={<Settings className="h-4 w-4" />}
            label="تنظیمات"
            hint="حریم خصوصی و حساب"
            iconClass="border-slate-400/30 bg-slate-400/10 text-slate-600 dark:text-slate-300"
            onNavigate={close}
          />
          {translationsPath ? (
            <ToolRow
              to={translationsPath}
              icon={<Languages className="h-4 w-4" />}
              label="آثار ترجمه"
              hint={translator?.name ?? 'مشاهده همه'}
              iconClass="border-sky-400/30 bg-sky-400/10 text-sky-600 dark:text-sky-300"
              onNavigate={close}
            />
          ) : null}
          <ToolRow
            to="/profile/favorites"
            icon={<Heart className="h-4 w-4" />}
            label="مرتب‌سازی علاقه‌مندی‌ها"
            hint={
              favoriteAnime.length > 0
                ? `${toPersianDigits(favoriteAnime.length)} انیمه`
                : 'قلب در جزئیات انیمه'
            }
            iconClass="border-rose-400/30 bg-rose-400/10 text-rose-600 dark:text-rose-300"
            onNavigate={close}
          />
          <ToolRow
            to="/profile/watch-archive"
            icon={<Archive className="h-4 w-4" />}
            label="آرشیو تماشا"
            hint={
              archiveCount > 0
                ? `${toPersianDigits(archiveCount)} انیمه`
                : 'وضعیت‌ها از پیشرفت تماشا'
            }
            iconClass="border-amber-400/30 bg-amber-400/10 text-amber-800 dark:text-amber-200"
            onNavigate={close}
          />
          <ToolRow
            to="/profile/playlists"
            icon={<ListMusic className="h-4 w-4" />}
            label="مدیریت پلی‌لیست‌ها"
            hint={
              customLists.length > 0
                ? `${toPersianDigits(customLists.length)} لیست${publicListCount > 0 ? ` · ${toPersianDigits(publicListCount)} عمومی` : ''}`
                : 'لیست‌های شخصی'
            }
            iconClass="border-violet-400/30 bg-violet-400/10 text-violet-700 dark:text-violet-300"
            onNavigate={close}
          />
          {commentsEnabled ? (
            <ToolRow
              to="/profile/activity"
              icon={<MessageSquareText className="h-4 w-4" />}
              label="همه نظرات"
              hint={commentHint}
              iconClass="border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
              onNavigate={close}
            />
          ) : null}
          <ToolRow
            to="/profile/badges"
            icon={<span className="text-base" aria-hidden>🏅</span>}
            label="نشان‌ها"
            hint="ویترین و پیشرفت"
            iconClass="border-primary-400/30 bg-primary-400/10 text-primary-400"
            onNavigate={close}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
